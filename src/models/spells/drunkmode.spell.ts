import { Player } from "../player";
import { Spell } from "../spell";

export class DrunkModeSpell extends Spell {
  constructor() {
    super({
      id: 3,
      name: "Drunk Mode",
      cooldown: 30,
      description: "Ce sort rend ivre temporairement le joueur Unity.",
      duration: 7,
      type: "Ivresse",
    });
  }

  cast(player: Player): void {
    player.vision = false;
    this.active = true;
    this.currentCooldown = this.cooldown;
    this.timer = this.duration;
  }

  reset(player: Player): void {
    player.vision = true;
  }

  spellReset(): void {
    this.duration = 7;
    this.currentCooldown = 0;
    this.timer = 0;
  }
}
