import { game } from "../../server";
import { Player } from "../player";
import { Item } from "./item";
import { v4 as uuid4 } from "uuid";

export const PHRASE_PASS: string[] = [
  "Désactivation",
  "Désamorçage",
  "LA BETE EST LA",
  "LA GAME",
  "Chrono",
];

export class Bomb extends Item {
  password: string;

  constructor(coords: { x: number; y: number; z: number }) {
    super({
      id: uuid4(),
      type: "BOMB",
      name: "Bomb",
      description: "A bomb that kills the player if the player walks on it",
      coords,
      cooldown: 20,
      castingTime: 1,
      duration: 15,
    });
    this.password = PHRASE_PASS[Math.floor(Math.random() * PHRASE_PASS.length)];
  }

  /* istanbul ignore next */
  activate(_: Player): void {}

  /* istanbul ignore next */
  deactivate(): void {}

  /* istanbul ignore next */
  reset(_: Player): void {}

  trigger(player: Player): void {
    player.health -= 1;
    game.state.timer -= 2;
    this.destroy();
  }
}
