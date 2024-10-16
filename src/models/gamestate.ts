export type GameStatus = "LOBBY" | "PLAYING" | "FINISHED";

export interface GameState {
  status: GameStatus;
  timer: number;
  loops: number;
}
