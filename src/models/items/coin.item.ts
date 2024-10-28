import { io } from "../../server";
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
      cooldown: 0,
      castingTime: 1,
      duration: 30,
    });
  }

  /* istanbul ignore next */
  activate(_: Player): void {}

  /* istanbul ignore next */
  deactivate(): void {}

  /* istanbul ignore next */
  reset(_: Player): void {}

  trigger(player: Player): void {
    player.coins += 1;
    // cast a speedboost spell
    io.to("unitys").emit("item:trigger", "Coin");
    console.log("Coin triggered");
    this.destroy();
  }
}
