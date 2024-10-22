import { Item } from "./item";

export class SlowBoost extends Item {
  constructor(id: string, coords: { x: number; y: number; z: number }) {
    super(
      "SLOWBOOST",
      id,
      "SlowBoost",
      "A slow boost that slows down the player",
      coords,
      10,
      2,
      8,
    );
  }
}
