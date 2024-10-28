import { Bomb } from "../models/items/bomb.item";
import { Coin } from "../models/items/coin.item";
import { FreezeItem } from "../models/items/freeze.item";
import { Wall } from "../models/items/wall.item";
import { ItemCategories, ItemCoords } from "../models/items/item";
import { game } from "../server";

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
  static place_one_at_random(
    map_array: number[][],
    type: ItemCategories,
  ): void {
    const sidewalk_coords = [];
    for (let i = 0; i < map_array.length; i++) {
      for (let j = 0; j < map_array[i].length; j++) {
        if (map_array[i][j] === 2) {
          sidewalk_coords.push({ x: i, y: j, z: 0 });
        }
      }
    }
    const random_coord =
      sidewalk_coords[Math.floor(Math.random() * sidewalk_coords.length)];
    const item = this.createItem({ category: type, coords: random_coord });

    game.state.items.push(item ? item : new Coin(random_coord));
  }
}
