import { Bomb } from "../models/items/bomb.item";
import { Coin } from "../models/items/coin.item";
import { FreezeItem } from "../models/items/freeze.item";
import { Wall } from "../models/items/wall.item";
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
      case "FREEZE":
        return new FreezeItem();
      case "WALL":
        return new Wall(coords);
      case "BOMB":
        return new Bomb(coords);
    }
    return null;
  };
}
