import { Socket } from "socket.io";
import { logger } from "../logger";
import { game } from "../server";
import { MessageHandler } from "./handler";
import { ItemCategories } from "../models/items/item";
import { ItemFactory } from "../factories/item.factory";
import {
  ITEM_ON_COOLDOWN,
  UNKNOWN_ITEM,
  UNKNOWN_PLAYER,
} from "../models/gameerror";

//  the objectif of this class is to handle the item message (coords, id of the player, type of the item) and check the cooldown of the player

export class ItemHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const payload: {
      ownerId: string;
      coords: { x: number; y: number; z: number };
      itemType: string;
    } = JSON.parse(message);
    const { itemType, ownerId, coords } = payload;
    const player = game.players[ownerId];

    if (!player) {
      this.socket.emit("error", UNKNOWN_PLAYER);
      logger.warn(`Player with id : ${ownerId} does not exist.`);
      return;
    }

    const item = ItemFactory.createItem({
      category: itemType as ItemCategories,
      coords,
      ownerId,
    });

    if (!item) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      logger.warn(`L'item de catégorie : ${itemType} est inconnu.`);
      return;
    }

    if (
      game.state.items.some(
        (item) =>
          item.type === payload.itemType &&
          item.ownerId === ownerId &&
          item.cooldown > 0,
      )
    ) {
      this.socket.emit("error", JSON.stringify(ITEM_ON_COOLDOWN));
      logger.warn(
        `Player ${player.name} with id ${ownerId} is on cooldown for item ${payload.itemType}`,
      );
      return;
    }

    game.state.items.push(item);
  }
}
