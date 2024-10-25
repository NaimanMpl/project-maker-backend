import { DEFAULT_PLAYER_SPEED, Player } from "../player";
import { Spell } from "../spell";

export class SuddenStopSpell extends Spell {
  constructor() {
    super({
      id: 2,
      name: "Sudden Stop",
      cooldown: 60,
      description: "Ce sort arrête brutalement le joueur Unity.",
      duration: 2,
      type: "Arrêt",
    });
  }

  cast(player: Player): void {
    player.speed = 0;
    this.active = true;
    this.currentCooldown = this.cooldown;
    this.timer = this.duration;
  }

  reset(player: Player) {
    player.speed = DEFAULT_PLAYER_SPEED;
    this.currentCooldown = this.cooldown;
  }

  spellReset(): void {
    this.duration = 2;
    this.currentCooldown = 0;
    this.timer = 0;
  }
}
