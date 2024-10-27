import { FreezeItem } from "./items/freeze.item";
import { Item, ItemCategories } from "./items/item";
import { Player } from "./player";

export interface ShopItem {
  type: ItemCategories;
  name: string;
  description: string;
  cost: number;
}

export class Shop {
  items: Item[];
  costs: Record<string, number>;

  constructor() {
    this.items = [];
    this.costs = {};
    this.addItem(new FreezeItem(), 100);
  }

  buyItem(player: Player, item: Item) {
    player.credits -= this.costs[item.type];
    player.specialItems?.push(item);
  }

  addItem(item: Item, cost: number) {
    this.items.push(item);
    this.costs[item.type] = cost;
  }
}
