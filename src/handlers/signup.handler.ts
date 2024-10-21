import { Socket } from "socket.io";
import {
  GAME_ALREADY_STARTED,
  USERNAME_ALREADY_TAKEN,
} from "../models/gameerror";
import { Player, PlayerType } from "../models/player";
import { io, game } from "../server";
import { MessageHandler } from "./handler";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logger";

export class SignUpHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const payload: { name: string; type: PlayerType } = JSON.parse(message);
    const { name, type } = payload;

    if (game.state.status !== "LOBBY") {
      this.socket.emit("error", JSON.stringify(GAME_ALREADY_STARTED));
      return;
    }

    if (Object.values(game.players).some((player) => player.name === name)) {
      this.socket.emit("error", JSON.stringify(USERNAME_ALREADY_TAKEN));
      this.socket.emit("signupfailed", JSON.stringify(USERNAME_ALREADY_TAKEN));
      return;
    }

    const player: Player = {
      id: uuidv4(),
      name,
      type,
    };

    game.players[player.id] = player;
    game.sockets[player.id] = this.socket;

    this.socket.emit("signupsuccess", JSON.stringify(player));
    this.socket.join("lobby");
    io.to("lobby").emit(
      "newplayer",
      JSON.stringify(Object.values(game.players)),
    );
    logger.info(`${player.name} (${player.type}) a rejoint le lobby.`);
  }
}