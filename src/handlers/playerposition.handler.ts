import { UNAUTHORIZED } from "../models/gameerror";
import { game } from "../server";
import { MessageHandler } from "./handler";

interface PlayerPositionPayload {
  id: string;
  x: number;
  y: number;
}

export class PlayerPositionHandler extends MessageHandler {
  handleMessage(message: string): void {
    const { id, x, y }: PlayerPositionPayload = JSON.parse(message);
    const player = game.getPlayer(id);

    if (!player) {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    player.position = {
      x,
      y: y + 0.3,
      z: 0,
    };
  }
}
