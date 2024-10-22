import { DEFAULT_PLAYER_SPEED, Player } from "../player";
import { Spell } from "../spell";

export class SlowModeSpell extends Spell {
  constructor() {
    super({
      id: 1,
      name: "Slow Mode",
      cooldown: 30,
      description: "This spell active the slow mode on the unity player.",
      duration: 10,
    });
  }

  cast(player: Player): void {
    player.speed = 5;
    this.active = true;
    this.currentCooldown = this.cooldown;
    this.timer = this.duration;
  }

  update(player: Player): void {
    if (this.currentCooldown > 0 && this.active) {
      this.currentCooldown -= 1 / game.config.tickRate;

      if (this.currentCooldown <= 0) {
        this.currentCooldown = 0;
      }
    }

    if (!this.active) {
      return;
    }

    if (this.duration && this.timer) {
      this.timer -= 1 / game.config.tickRate;

      if (this.timer <= 0) {
        this.active = false;
        this.timer = this.duration;
        this.reset(player);
      }
    }
  }

  reset(player: Player) {
    player.speed = DEFAULT_PLAYER_SPEED;
    this.currentCooldown = this.cooldown;
  }
}
