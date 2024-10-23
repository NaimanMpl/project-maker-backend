import { Socket } from "socket.io";
import { logger } from "../logger";
import { UNAUTHORIZED, UNITY_PLAYER_NOT_FOUND } from "../models/gameerror";
import { game, io } from "../server";
import { MessageHandler } from "./handler";
import { Coin } from "../models/items/coin.item";

export class StartHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const { id }: { id: string } = JSON.parse(message);

    const player = Object.values(game.players).find(
      (player) => player.id === id,
    );

    if (!player) {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    const unityPlayer = Object.values(game.players).find(
      (player) => player.type === "UNITY",
    );

    if (!unityPlayer && process.env.GAMEMODE === "unity") {
      io.emit("error", JSON.stringify(UNITY_PLAYER_NOT_FOUND));
      return;
    }

    const shuffledPlayers = game.webplayers.sort(() => 0.5 - Math.random());
    const half = Math.ceil(shuffledPlayers.length / 2);

    // Fill evilmans
    shuffledPlayers.slice(0, half).forEach((protector) => {
      const player = game.players[protector.id];
      const socket = game.sockets[protector.id];
      if (player) {
        game.players[player.id] = {
          ...player,
          role: "Protector",
          items: [new Coin({ x: 0, y: 0, z: 0 })],
        };
      }
      socket?.join("protectors");
    });

    // Fill protectors
    shuffledPlayers.slice(half).forEach((protector) => {
      const player = game.players[protector.id];
      const socket = game.sockets[protector.id];
      if (player) {
        game.players[player.id] = {
          ...player,
          role: "Evilman",
          items: [new Coin({ x: 0, y: 0, z: 0 })],
        };
      }
      socket?.join("evilmans");
    });

    game.state.status = "STARTING";
    game.state.startTimer = 5;

    io.to("lobby").emit(
      "start",
      JSON.stringify({
        player,
      }),
    );
    logger.info(`${player.name} a lancé la partie. Lancement du décompte`);
  }
}
