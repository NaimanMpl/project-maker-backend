import { Socket } from "socket.io";
import { logger } from "../logger";
import { game, io } from "../server";
import { MessageHandler } from "./handler";
import { ItemCategories } from "../models/items/item";
import { ItemFactory } from "../factories/item.factory";
import {
  ITEM_ON_COOLDOWN,
  NOT_A_PLAYER,
  UNKNOWN_ITEM,
} from "../models/gameerror";

//  the objectif of this class is to handle the item message (coords, id of the player, type of the item) and check the cooldown of the player

export class ItemHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const payload: {
      id: string;
      x: number;
      y: number;
      item: string;
    } = JSON.parse(message);
    const { item: itemType, x, y, id } = payload;
    const player = game.players[id];

    if (!player) {
      this.socket.emit("error", JSON.stringify(NOT_A_PLAYER));
      return;
    }

    const item = ItemFactory.createItem({
      category: itemType as ItemCategories,
      coords: { x, y, z: 0 },
    });

    if (!item) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      logger.warn(`L'item de catégorie : ${itemType} est inconnu.`);
      return;
    }

    item.owner = player;

    if (
      game.state.items.some(
        (item) =>
          item.type === itemType && item.owner?.id === id && item.cooldown > 0,
      )
    ) {
      this.socket.emit("error", JSON.stringify(ITEM_ON_COOLDOWN));
      logger.warn(
        `Player ${player.name} with id ${id} is on cooldown for item ${itemType}`,
      );
      return;
    }
    logger.info(`Le joueur ${player.name} a activé l'item ${item.type}`);
    item.place();
    io.emit("newitem", JSON.stringify(item));
  }
}
