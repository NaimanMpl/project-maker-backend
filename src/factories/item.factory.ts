import { Coin } from "../models/items/coin.item";
import { FreezeItem } from "../models/items/freeze.item";
import { ItemCoords } from "../models/items/item";

interface ItemParameters {
  category: string;
  coords: ItemCoords;
}

export class ItemFactory {
  static createItem = (parameters: ItemParameters) => {
    const { category, coords } = parameters;
    switch (category) {
      case "COIN":
        return new Coin(coords);
      case "FREEZE":
        return new FreezeItem();
    }
    return null;
  };
}
