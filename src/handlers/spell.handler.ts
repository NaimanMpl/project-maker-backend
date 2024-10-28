import { Socket } from "socket.io";
import { logger } from "../logger";
import {
  UNAUTHORIZED,
  UNITY_PLAYER_NOT_FOUND,
  UNKNOWN_PLAYER,
} from "../models/gameerror";
import { game } from "../server";
import { MessageHandler } from "./handler";

export class SpellHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    if (game.state.status !== "PLAYING") {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    const { playerId, id }: { playerId: string; id: number } =
      JSON.parse(message);

    const player = game.players[playerId];

    if (!player) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_PLAYER));
      return;
    }

    if (player.blind) {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    if (game.unitys.length === 0) {
      this.socket.emit("error", JSON.stringify(UNITY_PLAYER_NOT_FOUND));
      return;
    }

    game.unitys.forEach((unityPlayer) => {
      if (!player.spells[id].active) {
        const socket = game.sockets[unityPlayer.id];
        player.spells[id].cast(unityPlayer);
        socket?.emit(
          "cast:spell",
          JSON.stringify({ name: player.spells[id].name }),
        );
      }
    });

    logger.info(
      `${player.id} ${player?.name} ${player.type} as cast spell ${id}`,
    );
  }
}
