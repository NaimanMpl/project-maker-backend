import { Item } from "./items/item";
export type GameStatus =
  | "LOBBY"
  | "STOPPED"
  | "STARTING"
  | "PLAYING"
  | "WON"
  | "FINISHED";

export interface GameState {
  status: GameStatus;
  timer: number;
  startTimer: number;
  loops: number;
  map: number[][];
  items: Item[];
}
