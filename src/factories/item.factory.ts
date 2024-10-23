import { Coin } from "../models/items/coin.item";
import { ItemCategories, ItemCoords } from "../models/items/item";

interface ItemParameters {
  category: ItemCategories;
  coords: ItemCoords;
}

export class ItemFactory {
  static createItem = (parameters: ItemParameters) => {
    const { category, coords } = parameters;
    switch (category) {
      case "COIN":
        return new Coin(coords);
    }
    return null;
  };
}
