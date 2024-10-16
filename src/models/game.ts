import { Room } from "@models/room";
import { GameState } from "./gamestate";

export interface Game {
  rooms: Record<string, Room>;
  state: GameState;
}
