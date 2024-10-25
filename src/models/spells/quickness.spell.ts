import { DEFAULT_PLAYER_SPEED, Player } from "../player";
import { Spell } from "../spell";

export class QuicknessSpell extends Spell {
  constructor() {
    super({
      id: 3,
      name: "Quickness",
      cooldown: 40,
      description: "Ce sort permet d'accélérer la vitesse du joueur Unity.",
      duration: 10,
      type: "Rapidité",
    });
  }

  cast(player: Player): void {
    player.speed = 15;
    this.active = true;
    this.currentCooldown = this.cooldown;
    this.timer = this.duration;
  }

  reset(player: Player) {
    player.speed = DEFAULT_PLAYER_SPEED;
  }

  spellReset(): void {
    this.duration = 10;
    this.currentCooldown = 0;
    this.timer = 0;
  }
}
