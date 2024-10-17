import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import * as whoamihandler from "./handlers/whoami.handler";
import { Config } from "./models/config";
import { Game } from "./models/game";
import {
  GAME_ALREADY_STARTED,
  UNKNOWN_PLAYER,
  USERNAME_ALREADY_TAKEN,
} from "./models/gameerror";
import { GameState } from "./models/gamestate";
import { Player, PlayerType } from "./models/player";
import { Room } from "./models/room";

const rooms: Record<string, Room> = {
  lobby: {
    name: "lobby",
    players: [],
  },
};

const config: Config = {
  tickRate: 20,
};

const gameState: GameState = {
  status: "LOBBY",
  timer: 0,
  loops: 0,
};

const app = express();
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ message: "WebSocket Server Hello World" });
});

export const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server instance to ws
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const gameLoop = () => {
  gameState.timer += 1 / config.tickRate;

  io.emit("gamestate", JSON.stringify(gameState));
};

const interval = setInterval(gameLoop, 1000 / config.tickRate);

io.on("connection", (socket) => {
  console.log("Client connected");

  if (game.state.status === "LOBBY") {
    socket.join("lobby");
    socket.emit("lobbyplayers", JSON.stringify(game.rooms.lobby.players));
  }

  // Handle messages from clients
  socket.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
    socket.send(JSON.stringify({ message }));
  });

  socket.on("whoami", (message) => {
    const { id }: { id: string } = JSON.parse(message);
    const player = whoamihandler.getPlayer(game, id);

    if (!player) {
      socket.emit("error", JSON.stringify(UNKNOWN_PLAYER));
      return;
    }

    socket.emit("playerInfo", JSON.stringify(player));
  });

  socket.on("signup", (message) => {
    const payload: { name: string; type: PlayerType } = JSON.parse(message);
    const { name, type } = payload;

    if (game.state.status !== "LOBBY") {
      socket.emit("error", JSON.stringify(GAME_ALREADY_STARTED));
      return;
    }

    if (game.rooms.lobby.players.some((player) => player.name === name)) {
      socket.emit("error", JSON.stringify(USERNAME_ALREADY_TAKEN));
      socket.emit("signupfailed", JSON.stringify(USERNAME_ALREADY_TAKEN));
      return;
    }

    const player: Player = {
      id: uuidv4(),
      name,
      type,
    };

    game.rooms.lobby.players.push(player);

    socket.emit("signupsuccess", JSON.stringify(player));

    socket.join("lobby");
    io.to("lobby").emit("newplayer", JSON.stringify(rooms.lobby.players));
  });

  socket.on("logout", (message) => {
    const payload: { id: string } = JSON.parse(message);
    const { id } = payload;
    game.rooms.lobby.players = game.rooms.lobby.players.filter(
      (player) => player.id !== id,
    );
    const response: { players: Player[]; logoutPlayerId: string } = {
      players: game.rooms.lobby.players,
      logoutPlayerId: id,
    };
    io.to("lobby").emit("logoutplayer", JSON.stringify(response));
    console.log("Player : " + id + " quit the lobby.");
  });

  // Handle client disconnect
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

io.on("close", () => {
  clearInterval(interval);
});

server.on("close", () => {
  clearInterval(interval);
});

export const game: Game = {
  rooms,
  state: gameState,
};
