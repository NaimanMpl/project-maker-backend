import { game } from "../../server";
import { Player } from "../player";
import { Item } from "./item";
import { v4 as uuid4 } from "uuid";

export class FreezeItem extends Item {
  constructor() {
    super({
      id: uuid4(),
      type: "FREEZE",
      name: "Gel",
      description: "Gel l'équipe adverse pendant 5 secondes.",
      coords: { x: 0, y: 0, z: 0 },
      cooldown: 30,
      castingTime: 1,
      duration: 5,
    });
  }

  activate(caster: Player): void {
    if (caster.role === "Evilman") {
      game.protectors.forEach((player) => this.trigger(player));
    } else {
      game.evilmans.forEach((player) => this.trigger(player));
    }
    this.currentCooldown = this.cooldown;
  }

  trigger(player: Player): void {
    player.blind = true;
  }
}
