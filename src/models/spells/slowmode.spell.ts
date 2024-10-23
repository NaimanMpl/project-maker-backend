import { DEFAULT_PLAYER_SPEED, Player } from "../player";
import { Spell } from "../spell";

export class SlowModeSpell extends Spell {
  constructor() {
    super({
      id: 1,
      name: "Slow Mode",
      cooldown: 30,
      description: "Ce sort active le mode ralentissement sur le joueur Unity.",
      duration: 10,
      type: "Ralentissement",
    });
  }

  cast(player: Player): void {
    player.speed = 5;
    this.active = true;
    this.currentCooldown = this.cooldown;
    this.timer = this.duration;
  }

  reset(player: Player) {
    player.speed = DEFAULT_PLAYER_SPEED;
    this.currentCooldown = this.cooldown;
  }
}
