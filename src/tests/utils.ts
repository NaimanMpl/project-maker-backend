import { Game } from "../models/game";

export const resetGame = (game: Game) => {
  game.state.status = "LOBBY";
  game.rooms.lobby.players = [];
  game.rooms.evilmans.players = [];
  game.rooms.protectors.players = [];
  game.state.startTimer = 5;
  game.state.timer = 0;
  game.sockets = {};
  game.connections = {};
};
