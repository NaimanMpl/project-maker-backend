import { Player } from "../player";

export interface SpellOptions {
  id: number;
  name: string;
  cooldown: number;
  description: string;
  duration?: number;
  active?: boolean;
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

  constructor(options: SpellOptions) {
    const {
      id,
      name,
      cooldown,
      description,
      duration,
      active = false,
    } = options;

    this.id = id;
    this.name = name;
    this.cooldown = cooldown;
    this.description = description;
    this.duration = duration;
    this.active = active;
    this.timer = duration;
    this.currentCooldown = 0;
  }

  abstract cast(player: Player): void;
  abstract update(player: Player): void;
  abstract reset(player: Player): void;
}
