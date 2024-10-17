export interface GameError {
  type: string;
  message: string;
}

export const GAME_ALREADY_STARTED: GameError = {
  type: "GAME_ALREADY_STARTED",
  message: "Sorry, the game has already started.",
};

export const USERNAME_ALREADY_TAKEN: GameError = {
  type: "USERNAME_ALREADY_TAKEN",
  message: "Username is already taken.",
};

export const UNKNOWN_PLAYER: GameError = {
  type: "UNKNOWN_PLAYER",
  message: "The player was not found.",
};
