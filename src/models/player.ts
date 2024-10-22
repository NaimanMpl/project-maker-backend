import { Spell } from "./spells/spell";

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
}
