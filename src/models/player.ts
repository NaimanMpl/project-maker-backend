import { Item } from "./items/item";
import { Spell } from "./spell";

export type PlayerType = "WEB" | "UNITY";
export type PlayerRole = "Protector" | "Evilman" | "Player";
export const DEFAULT_PLAYER_SPEED = 10;

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  role?: PlayerRole;
  speed?: number;
  spells: Spell[];
  position?: {
    x: number;
    y: number;
    z: number;
  };
  coins: number;
  items: Item[];
  credits: number;
}
