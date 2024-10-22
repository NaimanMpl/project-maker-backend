import { Item } from "./item";

export class SpeedBoost extends Item {
  constructor(id: string, coords: { x: number; y: number; z: number }) {
    super(
      "SPEEDBOOST",
      id,
      "SpeedBoost",
      "A speed boost that increases the player's speed",
      coords,
      10,
      6,
      4,
    );
  }
}
