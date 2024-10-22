import { Socket } from "socket.io";
import { logger } from "../logger";
import { UNAUTHORIZED } from "../models/gameerror";
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

    const {
      playerId,
      id,
      name,
      cooldown,
    }: { playerId: string; id: number; name: string; cooldown: number } =
      JSON.parse(message);

    const player = game.players[playerId];
    game.unitys.forEach((unityPlayer) => {
      player.spells[id].cast(unityPlayer);
    });

    logger.info(
      `${player.id} ${player?.name} ${player.type} as cast spell ${id} ${name} with ${cooldown} seconds remaining before next use.`,
    );
  }
}
