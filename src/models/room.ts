import { Player } from "@models/player";

export interface Room {
  name: string;
  players: Player[];
}
