import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Game } from "./models/game";
import {
  GAME_ALREADY_STARTED,
  UNAUTHORIZED,
  UNITY_PLAYER_NOT_FOUND,
  UNKNOWN_PLAYER,
  USERNAME_ALREADY_TAKEN,
} from "./models/gameerror";
import { Player, PlayerType } from "./models/player";

export const game: Game = new Game();

const app = express();
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(cors());
/* istanbul ignore next */
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
  game.tick();
  io.emit("gamestate", JSON.stringify(game.state));
};

const interval = setInterval(gameLoop, 1000 / game.config.tickRate);

io.on("connection", (socket) => {
  console.log("Client connected");

  if (game.state.status === "LOBBY") {
    socket.join("lobby");
    socket.emit("lobbyplayers", JSON.stringify(Object.values(game.players)));
  }

  // Handle messages from clients
  socket.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
    socket.send(JSON.stringify({ message }));
  });

  socket.on("whoami", (message) => {
    const { id }: { id: string } = JSON.parse(message);
    const player = game.getPlayer(id);

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

    if (Object.values(game.players).some((player) => player.name === name)) {
      socket.emit("error", JSON.stringify(USERNAME_ALREADY_TAKEN));
      socket.emit("signupfailed", JSON.stringify(USERNAME_ALREADY_TAKEN));
      return;
    }

    const player: Player = {
      id: uuidv4(),
      name,
      type,
    };

    game.players[player.id] = player;
    game.sockets[player.id] = socket;

    socket.emit("signupsuccess", JSON.stringify(player));

    socket.join("lobby");
    io.to("lobby").emit("newplayer", Object.values(player));
  });

  socket.on("logout", (message) => {
    const payload: { id: string } = JSON.parse(message);
    const { id } = payload;
    delete game.players[id];
    delete game.sockets[id];
    const response: { players: Player[]; logoutPlayerId: string } = {
      players: Object.values(game.players),
      logoutPlayerId: id,
    };
    io.to("lobby").emit("logoutplayer", JSON.stringify(response));
    console.log("Player : " + id + " quit the lobby.");
  });

  socket.on("start", (message) => {
    const { id }: { id: string } = JSON.parse(message);

    const player = Object.values(game.players).find(
      (player) => player.id === id,
    );

    if (!player) {
      socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    const unityPlayer = Object.values(game.players).find(
      (player) => player.type === "UNITY",
    );

    if (!unityPlayer) {
      io.emit("error", JSON.stringify(UNITY_PLAYER_NOT_FOUND));
      return;
    }

    const shuffledPlayers = game.webplayers.sort(() => 0.5 - Math.random());
    const half = Math.ceil(shuffledPlayers.length / 2);

    // Fill evilmans
    shuffledPlayers.slice(0, half).forEach((protector) => {
      const player = game.players[protector.id];
      const socket = game.sockets[protector.id];
      if (player) {
        game.players[player.id] = { ...player, role: "Protector" };
      }
      socket?.join("protectors");
    });

    // Fill protectors
    shuffledPlayers.slice(half).forEach((protector) => {
      const player = game.players[protector.id];
      const socket = game.sockets[protector.id];
      if (player) {
        game.players[player.id] = { ...player, role: "Evilman" };
      }
      socket?.join("evilmans");
    });

    game.state.status = "STARTING";
    game.state.startTimer = 5;

    io.to("lobby").emit(
      "start",
      JSON.stringify({
        player,
      }),
    );
  });

  socket.on("disconnect", () => {
    const id = Object.entries(game.sockets).find(
      ([, playerSocket]) => socket.id === playerSocket?.id,
    )?.[0];

    if (!id) {
      return;
    }

    const player = game.players[id];
    delete game.players[id];
    delete game.sockets[id];

    if (game.state.status === "LOBBY") {
      io.to("lobby").emit(
        "newplayer",
        JSON.stringify(Object.values(game.players)),
      );
      console.log(`${player?.name} (${player?.type}) Client disconnected`);
    }
  });
});

/* istanbul ignore next */
io.on("close", () => {
  clearInterval(interval);
});

server.on("close", () => {
  clearInterval(interval);
});
