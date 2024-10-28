import { NOT_A_PLAYER, UNAUTHORIZED, UNKNOWN_ITEM } from "../models/gameerror";
import { game, io } from "../server";
import { MessageHandler } from "./handler";

export class ItemCancelHandler extends MessageHandler {
  handleMessage(message: string): void {
    const { id, itemId } = JSON.parse(message);
    const player = game.players[id];

    if (!player) {
      this.socket.emit("error", JSON.stringify(NOT_A_PLAYER));
      return;
    }

    if (player.blind) {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    const item = game.state.items.find((item) => item.id === itemId);
    if (!item) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      return;
    }
    const owner = item.owner;
    this.socket.emit("item:cancel:success", JSON.stringify(owner));

    if (player?.role === "Evilman") {
      io.to("protectors").emit("item:canceled", JSON.stringify(player));
    }
    if (player?.role === "Protector") {
      io.to("evilmans").emit("item:canceled", JSON.stringify(player));
    }

    game.state.items = game.state.items.filter((item) => item.id !== itemId);
  }
}
