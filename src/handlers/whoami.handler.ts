import { UNKNOWN_PLAYER } from "../models/gameerror";
import { MessageHandler } from "./handler";
import { game } from "../server";
import { Socket } from "socket.io";

export class WhoamiHandler extends MessageHandler {
  constructor(socket: Socket) {
    super(socket);
  }

  handleMessage(message: string): void {
    const { id }: { id: string } = JSON.parse(message);
    const player = game.getPlayer(id);

    if (!player) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_PLAYER));
      return;
    }

    this.socket.emit("playerInfo", JSON.stringify(player));
  }
}
