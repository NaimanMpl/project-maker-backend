import { Socket } from "socket.io";
import { game, io } from "../server";
import { MessageHandler } from "./handler";

export class DisconnectHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(_: string): void {
    if (game.state.status === "LOBBY") {
      return;
    }

    const id = Object.entries(game.sockets).find(
      ([, playerSocket]) => this.socket.id === playerSocket?.id,
    )?.[0];

    if (!id) {
      return;
    }

    const player = game.players[id];
    delete game.players[id];
    delete game.sockets[id];

    io.to("lobby").emit(
      "newplayer",
      JSON.stringify(Object.values(game.players)),
    );
    console.log(`${player?.name} (${player?.type}) Client disconnected`);
  }
}
