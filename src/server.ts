import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { DisconnectHandler } from "./handlers/disconnect.handler";
import { LogoutHandler } from "./handlers/logout.handler";
import { MapRequestHandler } from "./handlers/maprequest.handler";
import { PlayerPositionHandler } from "./handlers/playerposition.handler";
import { SignUpHandler } from "./handlers/signup.handler";
import { SpellHandler } from "./handlers/spell.handler";
import { StartHandler } from "./handlers/start.handler";
import { WhoamiHandler } from "./handlers/whoami.handler";
import { logger } from "./logger";
import { Game } from "./models/game";
import { PlayerPositionHandler } from "./handlers/playerposition.handler";
import { MapRequestHandler } from "./handlers/maprequest.handler";
import { ItemHandler } from "./handlers/item.handler";

export const game: Game = new Game();

const app = express();
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(cors());

/* istanbul ignore next */
app.get("/", (_, res) => {
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
  io.emit("gamestate", JSON.stringify({ ...game.state, map: undefined }));
};

const interval = setInterval(gameLoop, 1000 / game.config.tickRate);

io.on("connection", (socket) => {
  logger.info("Client connected");

  const whoamiHandler = new WhoamiHandler(socket);
  const signupHandler = new SignUpHandler(socket);
  const logoutHandler = new LogoutHandler(socket);
  const startHandler = new StartHandler(socket);
  const disconnectHandler = new DisconnectHandler(socket);
  const spellHandler = new SpellHandler(socket);
  const playerPositionHandler = new PlayerPositionHandler(socket);
  const mapRequestHandler = new MapRequestHandler(socket);
  const itemHandler = new ItemHandler(socket);

  if (game.state.status === "LOBBY") {
    socket.join("lobby");
    socket.emit("lobbyplayers", JSON.stringify(Object.values(game.players)));
  }

  socket.on("whoami", (msg) => whoamiHandler.handleMessage(msg));
  socket.on("signup", (msg) => signupHandler.handleMessage(msg));
  socket.on("logout", (msg) => logoutHandler.handleMessage(msg));
  socket.on("start", (msg) => startHandler.handleMessage(msg));
  socket.on("disconnect", (msg) => disconnectHandler.handleMessage(msg));
  socket.on("cast:spell", (msg) => spellHandler.handleMessage(msg));
  socket.on("cast:item", (msg) => itemHandler.handleMessage(msg));
  socket.on("player:position", (msg) =>
    playerPositionHandler.handleMessage(msg),
  );
  socket.on("maprequest", (msg) => mapRequestHandler.handleMessage(msg));
  socket.on("cast:spell", (msg) => spellHandler.handleMessage(msg));
});

/* istanbul ignore next */
io.on("close", () => {
  clearInterval(interval);
});

server.on("close", () => {
  clearInterval(interval);
});
