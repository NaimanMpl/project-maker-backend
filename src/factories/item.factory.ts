import { ItemCategories, ItemCoords } from "../models/items/item";
import { Item } from "../models/items/item";
import { v4 as uuidv4 } from "uuid";

interface ItemParameters {
  category: ItemCategories;
  coords: ItemCoords;
  ownerId: string;
}

export class ItemFactory {
  static createItem = (parameters: ItemParameters) => {
    const { category, coords, ownerId } = parameters;
    switch (category) {
      case "COINS":
        return new Item(
          "COINS",
          uuidv4(),
          "Coins",
          ownerId,
          "A pile of coins",
          coords,
          0,
          0,
          0,
        );
    }
    return null;
  };
}
