import { Socket } from "socket.io";
import { logger } from "../../logger";
import { Player } from "../../models/player";
import { game, io } from "../../server";
import { MessageHandler } from "../../handlers/handler";

export class LogoutHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const payload: { id: string } = JSON.parse(message);
    const { id } = payload;
    const logoutPlayer = game.players[id];

    if (!logoutPlayer) {
      logger.warn(`L'Id du joueur ${id} n'existe pas.`);
      return;
    }

    delete game.players[id];
    delete game.sockets[id];
    const response: { players: Player[]; logoutPlayer: Player } = {
      players: Object.values(game.players),
      logoutPlayer: logoutPlayer,
    };
    io.to("lobby").emit("logoutplayer", JSON.stringify(response));
  }
}
