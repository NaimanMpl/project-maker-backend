import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Game } from "./models/game";
import { WhoamiHandler } from "./handlers/whoami.handler";
import { SignUpHandler } from "./handlers/signup.handler";
import { LogoutHandler } from "./handlers/logout.handler";
import { StartHandler } from "./handlers/start.handler";
import { DisconnectHandler } from "./handlers/disconnect.handler";

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
  io.emit("gamestate", JSON.stringify(game.state));
};

const interval = setInterval(gameLoop, 1000 / game.config.tickRate);

io.on("connection", (socket) => {
  console.log("Client connected");

  const whoamiHandler = new WhoamiHandler(socket);
  const signupHandler = new SignUpHandler(socket);
  const logoutHandler = new LogoutHandler(socket);
  const startHandler = new StartHandler(socket);
  const disconnectHandler = new DisconnectHandler(socket);

  if (game.state.status === "LOBBY") {
    socket.join("lobby");
    socket.emit("lobbyplayers", JSON.stringify(Object.values(game.players)));
  }

  socket.on("whoami", (msg) => whoamiHandler.handleMessage(msg));
  socket.on("signup", (msg) => signupHandler.handleMessage(msg));
  socket.on("logout", (msg) => logoutHandler.handleMessage(msg));
  socket.on("start", (msg) => startHandler.handleMessage(msg));
  socket.on("disconnect", (msg) => disconnectHandler.handleMessage(msg));
});

/* istanbul ignore next */
io.on("close", () => {
  clearInterval(interval);
});

server.on("close", () => {
  clearInterval(interval);
});
