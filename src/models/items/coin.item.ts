import { Player } from "../player";
import { Item } from "./item";
import { v4 as uuid4 } from "uuid";

export class Coin extends Item {
  constructor(coords: { x: number; y: number; z: number }) {
    super({
      id: uuid4(),
      type: "COIN",
      name: "Coin",
      description: "A coin that gives points to the player",
      coords,
      cooldown: 30,
      castingTime: 1,
    });
  }

  activate(_: Player): void {}

  trigger(player: Player): void {
    player.coins += 1;
  }
}
