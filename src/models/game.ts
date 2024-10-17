import { GameState } from "./gamestate";
import { Room } from "./room";

export interface Game {
  rooms: Record<string, Room>;
  state: GameState;
}
