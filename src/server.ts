import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Config } from "./models/config";
import { Game } from "./models/game";
import { GAME_ALREADY_STARTED } from "./models/gameerror";
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

  // Handle messages from clients
  socket.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
    socket.send(JSON.stringify({ message }));
  });

  let waitingQuit = false;

  socket.on("signup", (message) => {
    const payload: { name: string; type: PlayerType } = JSON.parse(message);
    const { name, type } = payload;

    if (game.state.status !== "LOBBY") {
      socket.emit("error", JSON.stringify(GAME_ALREADY_STARTED));
      return;
    }

    const player: Player = {
      id: uuidv4(),
      name,
      type,
      quitting: false,
    };

    game.rooms.lobby.players.push(player);

    socket.emit("signupsuccess", JSON.stringify(player));

    socket.join("lobby");
    io.to("lobby").emit("newplayer", JSON.stringify(rooms.lobby.players));
    waitingQuit = true;
  });

  socket.on("quitting", (message) => {
    const payload: { id: string } = JSON.parse(message);
    const { id } = payload;
    const index = game.rooms.lobby.players.indexOf(id);
    console.log(game.rooms.lobby.players);

    game.rooms.lobby.players.splice(index, 1);

    io.to("lobby").emit("newplayer", JSON.stringify(rooms.lobby.players));
    console.log(game.rooms.lobby.players);

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
