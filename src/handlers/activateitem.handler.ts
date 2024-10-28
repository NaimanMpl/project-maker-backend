import { logger } from "../logger";
import {
  ITEM_ON_COOLDOWN,
  NOT_A_PLAYER,
  UNAUTHORIZED,
  UNKNOWN_ITEM,
} from "../models/gameerror";
import { ItemCategories } from "../models/items/item";
import { game } from "../server";
import { MessageHandler } from "./handler";

export class ActivateItemHandler extends MessageHandler {
  handleMessage(message: string): void {
    const { id, item }: { id: string; item: ItemCategories } =
      JSON.parse(message);
    const player = game.players[id];

    if (!player) {
      this.socket.emit("error", JSON.stringify(NOT_A_PLAYER));
      return;
    }

    if (player.blind) {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    const specialItem = player.specialItems?.find(
      (specialItem) => specialItem.type === item,
    );

    if (!specialItem) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      return;
    }

    if (specialItem.currentCooldown > 0) {
      this.socket.emit("error", JSON.stringify(ITEM_ON_COOLDOWN));
      return;
    }

    logger.info(`${player.name} active l'item ${item} sur l'équipe adverse`);
    specialItem.activate(player);
    this.socket.emit("item:activate:success", undefined);
  }
}
