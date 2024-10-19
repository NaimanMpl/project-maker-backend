import { Socket } from "socket.io";
import { GameState } from "./gamestate";
import { Room } from "./room";

export interface Game {
  rooms: Record<string, Room>;
  state: GameState;
  sockets: Record<string, Socket>;
  connections: Record<string, string>;
}
