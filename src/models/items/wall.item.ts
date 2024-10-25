import { Player } from "../player";
import { Item } from "./item";
import { v4 as uuid4 } from "uuid";

export class Wall extends Item {
  constructor(coords: { x: number; y: number; z: number }) {
    super({
      id: uuid4(),
      type: "WALL",
      name: "Wall",
      description: " A wall that block the path of the player",
      coords,
      cooldown: 10,
      castingTime: 1,
      duration: 15,
    });
  }

  trigger(player: Player): void {
    console.info("Wall touched by : ", player.name);
  }
}
