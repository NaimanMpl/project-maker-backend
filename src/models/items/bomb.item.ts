import { Player } from "../player";
import { Item } from "./item";
import { v4 as uuid4 } from "uuid";

export class Bomb extends Item {
  constructor(coords: { x: number; y: number; z: number }) {
    super({
      id: uuid4(),
      type: "BOMB",
      name: "Bomb",
      description: "A bomb that kills the player if the player walks on it",
      coords,
      cooldown: 15,
      castingTime: 1,
      duration: 15,
    });
  }

  trigger(player: Player): void {
    player.health -= 1;
    this.destroy();
  }
}
