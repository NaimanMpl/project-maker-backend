import { game } from "../server";
import { Player } from "./player";

export interface SpellOptions {
  id: number;
  name: string;
  cooldown: number;
  description: string;
  duration?: number;
  active?: boolean;
  type: string;
}

export abstract class Spell {
  id: number;
  name: string;
  cooldown: number;
  description: string;
  duration?: number;
  active: boolean;
  timer?: number;
  currentCooldown: number;
  type: string;

  constructor(options: SpellOptions) {
    const {
      id,
      name,
      cooldown,
      description,
      duration,
      active = false,
      type,
    } = options;

    this.id = id;
    this.name = name;
    this.cooldown = cooldown;
    this.description = description;
    this.duration = duration;
    this.active = active;
    this.timer = duration;
    this.currentCooldown = 0;
    this.type = type;
  }

  abstract cast(player: Player): void;
  abstract reset(player: Player): void;

  update(player: Player): void {
    if (this.currentCooldown > 0) {
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

  abstract spellReset(): void;
}
