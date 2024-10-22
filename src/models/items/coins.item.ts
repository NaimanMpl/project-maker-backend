import { Item } from "./item";

export class Coin extends Item {
  constructor(id: string, coords: { x: number; y: number; z: number }) {
    super(
      "COINS",
      id,
      "Coin",
      "A coin that gives points to the player",
      coords,
      1,
      0,
      999999999999999,
    );
  }
}
