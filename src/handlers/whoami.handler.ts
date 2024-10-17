import { Game } from "@/models/game";

export const getPlayer = (game: Game, id: string) => {
  return game.rooms.lobby.players.find((player) => player.id === id);
};
