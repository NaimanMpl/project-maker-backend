import { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logger";
import {
  GAME_ALREADY_STARTED,
  USERNAME_ALREADY_TAKEN,
} from "../models/gameerror";
import { DEFAULT_PLAYER_SPEED, Player, PlayerType } from "../models/player";
import { game, io } from "../server";
import { MessageHandler } from "./handler";

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
      health: 1,
      spells: [],
      speed: 0,
      coins: 0,
      credits: 0,
      items: [],
      specialItems: [],
    };

    if (player.type === "UNITY") {
      player.speed = DEFAULT_PLAYER_SPEED;
    }

    game.players[player.id] = player;
    game.sockets[player.id] = this.socket;

    this.socket.emit("signupsuccess", JSON.stringify(player));
    io.to("lobby").emit("signup:newplayer", JSON.stringify(player));
    this.socket.join("lobby");
    io.to("lobby").emit(
      "newplayer",
      JSON.stringify(Object.values(game.players)),
    );
    logger.info(`${player.name} (${player.type}) a rejoint le lobby.`);
  }
}
