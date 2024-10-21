import { Socket } from "socket.io";
import { Player } from "../models/player";
import { game, io } from "../server";
import { MessageHandler } from "./handler";

export class LogoutHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const payload: { id: string } = JSON.parse(message);
    const { id } = payload;
    delete game.players[id];
    delete game.sockets[id];
    const response: { players: Player[]; logoutPlayerId: string } = {
      players: Object.values(game.players),
      logoutPlayerId: id,
    };
    io.to("lobby").emit("logoutplayer", JSON.stringify(response));
  }
}
