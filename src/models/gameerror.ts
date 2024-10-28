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

export const NOT_A_PLAYER: GameError = {
  type: "NOT_A_PLAYER",
  message: "You're not in the players list.",
};

export const UNAUTHORIZED: GameError = {
  type: "UNAUTHORIZED",
  message: "You cannot perform this action.",
};

export const UNITY_PLAYER_NOT_FOUND: GameError = {
  type: "UNITY_PLAYER_NOT_FOUND",
  message: "The unity player was not found.",
};

export const ITEM_ON_COOLDOWN: GameError = {
  type: "ITEM_ON_COOLDOWN",
  message: "The item is on cooldown.",
};

export const CANCEL_ON_COOLDOWN: GameError = {
  type: "CANCEL_ON_COOLDOWN",
  message: "The cancel item is on cooldown.",
};

export const UNKNOWN_ITEM: GameError = {
  type: "UNKNOWN_ITEM",
  message: "The following item is unknown.",
};

export const NO_ENOUGH_CREDITS: GameError = {
  type: "NO_ENOUGH_CREDITS",
  message: "You don't have enough credits.",
};

export const DEV_MODE_NOT_ENABLED = {
  type: "DEV_MODE_NOT_ENABLED",
  message: "The development mode is not enabled.",
};
export const NO_EVENT = {
  type: "NO_EVENT",
  message: "There is no event currently active.",
};
