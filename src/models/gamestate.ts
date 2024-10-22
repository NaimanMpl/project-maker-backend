import { item } from "./items/item";

export type GameStatus = "LOBBY" | "STARTING" | "PLAYING" | "FINISHED";

export interface GameState {
  status: GameStatus;
  timer: number;
  startTimer: number;
  loops: number;
  map: number[][];
  items: item[];
}
