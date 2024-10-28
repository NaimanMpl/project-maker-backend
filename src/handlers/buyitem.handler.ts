import { ItemFactory } from "../factories/item.factory";
import {
  NO_ENOUGH_CREDITS,
  NOT_A_PLAYER,
  UNAUTHORIZED,
  UNKNOWN_ITEM,
} from "../models/gameerror";
import { ItemCategories } from "../models/items/item";
import { game } from "../server";
import { MessageHandler } from "./handler";

export class BuyItemHandler extends MessageHandler {
  handleMessage(message: string): void {
    const { id, type }: { id: string; type: ItemCategories } =
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

    const item = ItemFactory.createItem({
      category: type,
      coords: { x: 0, y: 0, z: 0 },
    });

    if (
      !item ||
      !game.shop.items.find((shopItem) => shopItem.type === item.type)
    ) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      return;
    }

    if (player.credits < game.shop.costs[item.type]) {
      this.socket.emit("error", JSON.stringify(NO_ENOUGH_CREDITS));
      return;
    }

    game.shop.buyItem(player, item);
    this.socket.emit("shop:buy:success", JSON.stringify(item));
  }
}
