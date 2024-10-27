import { ShopItem } from "../models/shop";
import { game } from "../server";
import { MessageHandler } from "./handler";

export class ShopHandler extends MessageHandler {
  handleMessage(_: string): void {
    const shopItems = game.shop.items.reduce((array, item) => {
      array.push({
        type: item.type,
        name: item.name,
        description: item.description,
        cost: game.shop.costs[item.type] ?? 9999,
      });
      return array;
    }, [] as ShopItem[]);
    this.socket.emit("shop", JSON.stringify({ items: shopItems }));
  }
}
