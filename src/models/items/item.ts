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
  ownerId: string;
  description: string;
  coords: { x: number; y: number; z: number };
  cooldown: number;
  castingTime: number;
  duration: number;

  reduceTimers(reduction: number): void {
    if (this.castingTime > 0) {
      this.castingTime -= reduction;
    }
    if (this.cooldown > 0) {
      this.cooldown -= reduction;
    }
    if (this.duration > 0) {
      this.duration -= reduction;
    }
    if (this.duration <= 0) {
      this.destroy();
    }
  }

  place(): void {
    console.log("Item : " + this.type + " placed");
  }

  trigger(): void {
    console.log("Item : " + this.type + " triggered");
  }

  destroy(): void {
    console.log(
      "Item : " + this.id + " of type " + this.type + "has been destroyed",
    );
  }

  constructor(
    type: ItemCategories,
    id: string,
    name: string,
    ownerId: string,
    description: string,
    coords: ItemCoords,
    cooldown: number,
    castingTime: number,
    duration: number,
  ) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.ownerId = ownerId;
    this.description = description;
    this.coords = coords;
    this.castingTime = castingTime;
    this.cooldown = cooldown;
    this.duration = duration;
  }
}
