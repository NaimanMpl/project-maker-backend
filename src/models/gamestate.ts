import { Item } from "./items/item";
import { Tile } from "./tile";

export type GameStatus = "LOBBY" | "STARTING" | "PLAYING" | "FINISHED";

export interface GameState {
  status: GameStatus;
  timer: number;
  startTimer: number;
  finishedTimer: number;
  loops: number;
  startPoint?: Tile;
  endPoint?: Tile;
  map: number[][];
  items: Item[];
}
