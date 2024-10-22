export type ItemCategories =
  | "LANDMINE"
  | "WALL"
  | "SPEEDBOOST"
  | "SLOWBOOST"
  | "COINS";

export interface ItemCoords {
  x: number;
  y: number;
  z: number;
}

export class Item {
  type: ItemCategories;
  id: string;
  name: string;
  description: string;
  coords: { x: number; y: number; z: number };
  cooldown: number;
  castingTime: number;
  duration: number;

  get infinite(): boolean {
    return this.duration === -1;
  }

  place(): void {
    console.log("Item : " + this.type + " placed");
  }

  trigger(): void {
    console.log("Item : " + this.type + " triggered");
  }

  destroy(): void {
    console.log("Item : " + this.type + " destroyed");
  }

  constructor(
    type: ItemCategories,
    id: string,
    name: string,
    description: string,
    coords: ItemCoords,
    cooldown: number,
    castingTime: number,
    duration: number,
  ) {
    this.type = type;
    this.id = id;
    this.coords = coords;
    this.name = name;
    this.description = description;
    this.castingTime = castingTime;
    this.cooldown = cooldown;
    this.duration = duration;
  }
}
