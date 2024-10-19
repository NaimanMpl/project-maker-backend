import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { map } from "../assets/map.json";
import unityMap from "../assets/unityMap.json";
import * as whoamihandler from "./handlers/whoami.handler";
import { Config } from "./models/config";
import { Game } from "./models/game";
import {
  GAME_ALREADY_STARTED,
  UNAUTHORIZED,
  UNITY_PLAYER_NOT_FOUND,
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
  protectors: {
    name: "protectors",
    players: [],
  },
  evilmans: {
    name: "evilmans",
    players: [],
  },
  unity: {
    name: "unity",
    players: [],
  },
};

const config: Config = {
  tickRate: 20,
};

const sockets: Record<string, Socket> = {};

const gameState: GameState = {
  status: "LOBBY",
  timer: 0,
  startTimer: 5,
  loops: 0,
  map: map,
};

const connections: Record<string, string> = {};

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
  if (game.state.status === "STARTING") {
    game.state.startTimer = Math.max(
      0,
      game.state.startTimer - 1 / config.tickRate,
    );

    if (game.state.startTimer === 0) {
      game.state.status = "PLAYING";
      const allUnityPlayers = [
        ...game.rooms.evilmans.players,
        ...game.rooms.protectors.players,
        ...game.rooms.unity.players,
      ].filter((player) => player.type === "UNITY");
      allUnityPlayers.forEach((player) => {
        sockets[player.id]?.emit("go", JSON.stringify({ unityMap }));
      });
    }
  }

  if (game.state.status === "PLAYING") {
    gameState.timer += 1 / config.tickRate;

    game.rooms.evilmans.players.forEach((evilman) => {
      sockets[evilman.id]?.emit("playerInfo", JSON.stringify(evilman));
    });
    game.rooms.protectors.players.forEach((protector) => {
      sockets[protector.id]?.emit("playerInfo", JSON.stringify(protector));
    });
    game.rooms.unity.players.forEach((player) => {
      sockets[player.id]?.emit("playerInfo", JSON.stringify(player));
    });
  }

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
    // console.log(`Received message: ${message}`);
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
    sockets[player.id] = socket;
    game.connections[socket.id] = player.id;

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

  socket.on("start", (message) => {
    const { id }: { id: string } = JSON.parse(message);

    const player = game.rooms.lobby.players.find((player) => player.id === id);

    if (!player) {
      socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    const unityPlayer = game.rooms.lobby.players.find(
      (player) => player.type === "UNITY",
    );

    if (!unityPlayer) {
      io.emit("error", JSON.stringify(UNITY_PLAYER_NOT_FOUND));
      return;
    }

    game.rooms.unity.players.push(unityPlayer);

    const webPlayers = game.rooms.lobby.players.filter(
      (player) => player.type === "WEB",
    );

    const shuffledPlayers = webPlayers.sort(() => 0.5 - Math.random());

    const half = Math.ceil(shuffledPlayers.length / 2);

    const protectors = shuffledPlayers
      .slice(0, half)
      .map((player) => ({ ...player, role: "Protector" }));
    const evilmans = shuffledPlayers
      .slice(half)
      .map((player) => ({ ...player, role: "Evilman" }));

    game.rooms.evilmans.players = evilmans as Player[];
    game.rooms.protectors.players = protectors as Player[];

    evilmans.forEach((evilman) => {
      sockets[evilman.id]?.join("evilmans");
    });

    protectors.forEach((protector) => {
      sockets[protector.id]?.join("protectors");
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

  // Handle client disconnect
  socket.on("disconnect", () => {
    const playerId = game.connections[socket.id];
    if (game.state.status === "LOBBY") {
      const player = game.rooms.lobby.players.find(
        (player) => player.id === playerId,
      );
      game.rooms.lobby.players = game.rooms.lobby.players.filter(
        (player) => player.id !== playerId,
      );
      io.to("lobby").emit(
        "newplayer",
        JSON.stringify(game.rooms.lobby.players),
      );
      console.log(`${player?.name} (${player?.type}) Client disconnected`);
    }
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
  sockets,
  connections,
};
