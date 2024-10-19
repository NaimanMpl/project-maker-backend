import { Game } from "@/models/game";

export const getPlayer = (game: Game, id: string) => {
  if (game.state.status === "LOBBY") {
    return game.rooms.lobby.players.find((player) => player.id === id);
  }

  const allPlayers = [
    ...game.rooms.evilmans.players,
    ...game.rooms.protectors.players,
    ...game.rooms.unity.players,
  ];

  return allPlayers.find((player) => player.id === id);
};
