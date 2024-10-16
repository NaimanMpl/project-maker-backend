export type PlayerType = "WEB" | "UNITY";
export type PlayerRole = "Protector" | "Evilman" | "Player";

export interface Player {
  name: string;
  type: PlayerType;
  role?: PlayerRole;
}
