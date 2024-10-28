import { logger } from "../logger";
import { NO_EVENT, NOT_A_PLAYER } from "../models/gameerror";
import { game } from "../server";
import { MessageHandler } from "./handler";

export class EventHandler extends MessageHandler {
  handleMessage(message: string): void {
    const { id, response } = JSON.parse(message);
    const player = game.players[id];

    if (!player) {
      this.socket.emit("error", JSON.stringify(NOT_A_PLAYER));
      return;
    }

    const event = game.currentEvent;
    if (!event) {
      this.socket.emit("error", JSON.stringify(NO_EVENT));
      return;
    }

    logger.info(
      `${player.name} a soumis ${response} dans l'event ${event.type}`,
    );
    event.submitResponse(player, response);
    this.socket.emit("event:submit:success", undefined);
  }
}
