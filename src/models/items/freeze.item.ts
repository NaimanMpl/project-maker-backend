import { logger } from "../../logger";
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
      cooldown: 60,
      castingTime: 1,
      duration: 5,
    });
    this.special = true;
  }

  activate(caster: Player): void {
    this.casted = true;
    this.owner = { ...caster, specialItems: undefined };
    if (caster.role === "Evilman") {
      game.protectors.forEach((player) => this.trigger(player));
    } else {
      game.evilmans.forEach((player) => this.trigger(player));
    }
    this.currentCooldown = this.cooldown;
  }

  reset(player: Player): void {
    player.blind = false;
  }

  deactivate(): void {
    logger.info(`L'item ${this.type} se désactive`);
    game.webplayers.forEach((player) => this.reset(player));
    if (this.owner) {
      const owner = game.players[this.owner.id];
      if (owner?.specialItems) {
        owner.specialItems = owner.specialItems.filter(
          (item) => item.id !== this.id,
        );
      }
    }
    this.currentCooldown = this.cooldown;
  }

  trigger(player: Player): void {
    player.blind = true;
  }
}
