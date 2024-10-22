import { Socket } from "socket.io";
import { logger } from "../logger";
import { UNAUTHORIZED, UNKNOWN_PLAYER } from "../models/gameerror";
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

    game.unitys.forEach((unityPlayer) => {
      player.spells[id].cast(unityPlayer);
    });

    logger.info(
      `${player.id} ${player?.name} ${player.type} as cast spell ${id}`,
    );
  }
}
