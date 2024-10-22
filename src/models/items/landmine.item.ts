import { Item } from "./item";

export class Landmine extends Item {
  constructor(id: string, coords: { x: number; y: number; z: number }) {
    super(
      "LANDMINE",
      id,
      "Landmine",
      "A landmine that explodes when a player steps on it",
      coords,
      10,
      3,
      40,
    );
  }
}
