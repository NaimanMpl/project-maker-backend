import { Item } from "./item";

export class Wall extends Item {
  constructor(id: string, coords: { x: number; y: number; z: number }) {
    super(
      "WALL",
      id,
      "Wall",
      "A wall that blocks the path of players",
      coords,
      10,
      8,
      2,
    );
  }
}
