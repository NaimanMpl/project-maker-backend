export interface GameError {
  type: string;
  message: string;
}

export const GAME_ALREADY_STARTED: GameError = {
  type: "GAME_ALREADY_STARTED",
  message: "Sorry, the game has already started.",
};
