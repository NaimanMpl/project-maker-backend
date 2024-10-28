import {
  CANCEL_ON_COOLDOWN,
  NOT_A_PLAYER,
  UNAUTHORIZED,
  UNKNOWN_ITEM,
} from "../models/gameerror";
import { DEFAULT_CANCEL_COOLDOWN } from "../models/player";
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

    if (player.cancelCooldown && player.cancelCooldown > 0) {
      this.socket.emit("error", JSON.stringify(CANCEL_ON_COOLDOWN));
      return;
    }

    const item = game.state.items.find((item) => item.id === itemId);
    if (!item) {
      this.socket.emit("error", JSON.stringify(UNKNOWN_ITEM));
      return;
    }
    const owner = item.owner;
    this.socket.emit("item:cancel:success", JSON.stringify(owner));

    if (owner?.role === "Evilman") {
      io.to("protectors").emit("item:canceled", JSON.stringify(player));
    }
    if (owner?.role === "Protector") {
      io.to("evilmans").emit("item:canceled", JSON.stringify(player));
    }

    player.cancelCooldown = DEFAULT_CANCEL_COOLDOWN;
    game.state.items = game.state.items.filter((item) => item.id !== itemId);
  }
}
