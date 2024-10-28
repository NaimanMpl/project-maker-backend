import { Item } from "./items/item";
import { Spell } from "./spell";

export type PlayerType = "WEB" | "UNITY";
export type PlayerRole = "Protector" | "Evilman" | "Player";
export const DEFAULT_PLAYER_SPEED = 10;
export const DEFAULT_PLAYER_HEALTH = 1;
export const DEFAULT_CANCEL_COOLDOWN = 3;

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  role?: PlayerRole;
  speed?: number;
  health: number;
  spells: Spell[];
  position?: {
    x: number;
    y: number;
    z: number;
  };
  coins: number;
  items: Item[];
  specialItems?: Item[];
  vision?: boolean;
  credits: number;
  blind?: boolean;
  cancelCooldown?: number;
}
