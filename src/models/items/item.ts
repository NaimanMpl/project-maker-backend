import { game } from "../../server";
import { Player } from "../player";

export type ItemCategories =
  | "LANDMINE"
  | "WALL"
  | "SPEEDBOOST"
  | "SLOWBOOST"
  | "COIN"
  | "FREEZE";

export interface ItemCoords {
  x: number;
  y: number;
  z: number;
}

export interface ItemOptions {
  type: ItemCategories;
  id: string;
  name: string;
  owner?: Player;
  description: string;
  coords: { x: number; y: number; z: number };
  cooldown: number;
  castingTime: number;
  duration?: number;
}

export abstract class Item {
  type: ItemCategories;
  id: string;
  name: string;
  owner?: Player;
  description: string;
  coords: { x: number; y: number; z: number };
  cooldown: number;
  castingTime: number;
  duration?: number;

  update(reduction: number): void {
    if (this.castingTime > 0) {
      this.castingTime -= reduction;
    }
    if (this.cooldown > 0) {
      this.cooldown -= reduction;
    }
    if (this.duration != undefined && this.duration > 0) {
      this.duration -= reduction;
    }
    if (this.duration !== undefined && this.duration <= 0) {
      this.destroy();
    }
  }

  place(): void {
    game.state.items.push(this);
  }

  abstract trigger(player: Player): void;

  destroy(): void {
    game.state.items = game.state.items.filter((item) => item.id !== this.id);
  }

  constructor(options: ItemOptions) {
    const {
      type,
      id,
      name,
      owner,
      description,
      coords,
      castingTime,
      cooldown,
      duration,
    } = options;
    this.type = type;
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.description = description;
    this.coords = coords;
    this.castingTime = castingTime;
    this.cooldown = cooldown;
    this.duration = duration;
  }
}
