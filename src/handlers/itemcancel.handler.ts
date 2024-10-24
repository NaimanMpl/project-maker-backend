import { NOT_A_PLAYER, UNKNOWN_ITEM } from "../models/gameerror";
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

    const item = game.state.items.find((item) => item.id === itemId);
    if (!item) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      return;
    }
    const owner = item.owner;
    this.socket.emit("item:cancel:success", owner);

    if (owner?.role === "Evilman") {
      io.to("protectors").emit("item:canceled", JSON.stringify(player));
    }
    if (owner?.role === "Protector") {
      io.to("evilmans").emit("item:canceled", JSON.stringify(player));
    }

    game.state.items = game.state.items.filter((item) => item.id !== itemId);
  }
}
