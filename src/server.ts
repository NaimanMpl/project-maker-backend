import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { DisconnectHandler } from "./handlers/disconnect.handler";
import { ItemHandler } from "./handlers/item.handler";
import { LogoutHandler } from "./handlers/logout.handler";
import { MapRequestHandler } from "./handlers/maprequest.handler";
import { PlayerPositionHandler } from "./handlers/playerposition.handler";
import { RestartHandler } from "./handlers/restart.handler";
import { SignUpHandler } from "./handlers/signup.handler";
import { SpellHandler } from "./handlers/spell.handler";
import { StartHandler } from "./handlers/start.handler";
import { WhoamiHandler } from "./handlers/whoami.handler";
import { logger } from "./logger";
import { Game } from "./models/game";
import { ItemCancelHandler } from "./handlers/itemcancel.handler";
import { EventHandler } from "./handlers/event.handler";
import { ShopHandler } from "./handlers/shop.handler";
import { BuyItemHandler } from "./handlers/buyitem.handler";
import { ActivateItemHandler } from "./handlers/activateitem.handler";

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

export const interval = setInterval(gameLoop, 1000 / game.config.tickRate);

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
  const restartHandler = new RestartHandler(socket);
  const itemCancelHandler = new ItemCancelHandler(socket);
  const eventHandler = new EventHandler(socket);
  const shopHandler = new ShopHandler(socket);
  const buyItemHandler = new BuyItemHandler(socket);
  const activateItemHandler = new ActivateItemHandler(socket);

  socket.emit(
    "devmode",
    JSON.stringify({ dev: process.env.DEV_MODE === "enabled" }),
  );

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
  socket.on("restart", (msg) => restartHandler.handleMessage(msg));
  socket.on("item:cancel", (msg) => itemCancelHandler.handleMessage(msg));
  socket.on("event:submit", (msg) => eventHandler.handleMessage(msg));
  socket.on("shoprequest", (msg) => shopHandler.handleMessage(msg));
  socket.on("shop:buy", (msg) => buyItemHandler.handleMessage(msg));
  socket.on("item:activate", (msg) => activateItemHandler.handleMessage(msg));
});

/* istanbul ignore next */
io.on("close", () => {
  clearInterval(interval);
});

server.on("close", () => {
  clearInterval(interval);
});
