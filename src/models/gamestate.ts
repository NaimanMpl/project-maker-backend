import { Event } from "./event";
import { Item } from "./items/item";
import { Tile } from "./tile";

export type GameStatus =
  | "LOBBY"
  | "STARTING"
  | "PLAYING"
  | "FINISHED"
  | "EVENT";

export interface GameState {
  status: GameStatus;
  timer: number;
  startTimer: number;
  itemTimer: number;
  finishedTimer: number;
  eventTimer: number;
  loops: number;
  startPoint?: Tile;
  endPoint?: Tile;
  map: number[][];
  items: Item[];
  currentEvent?: Event;
}
