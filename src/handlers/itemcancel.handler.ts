import {
  CANCEL_ON_COOLDOWN,
  NOT_A_PLAYER,
  UNAUTHORIZED,
  UNKNOWN_ITEM,
  WRONG_PASSWORD,
} from "../models/gameerror";
import { Bomb } from "../models/items/bomb.item";
import { DEFAULT_CANCEL_COOLDOWN } from "../models/player";
import { game, io } from "../server";
import { MessageHandler } from "./handler";

export class ItemCancelHandler extends MessageHandler {
  handleMessage(message: string): void {
    const { id, itemId, password } = JSON.parse(message);
    const player = game.players[id];

    if (!player) {
      this.socket.emit("error", JSON.stringify(NOT_A_PLAYER));
      return;
    }

    if (player.blind) {
      this.socket.emit("error", JSON.stringify(UNAUTHORIZED));
      return;
    }

    if (player.role === "Evilman") {
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

    if (item instanceof Bomb) {
      if (item.password !== password) {
        player.blind = true;
        setTimeout(() => {
          player.blind = false;
          this.socket.emit("player:unblind", undefined);
        }, 2000);
        this.socket.emit("error", JSON.stringify(WRONG_PASSWORD));
        return;
      }
    }

    const owner = item.owner;
    this.socket.emit("item:cancel:success", JSON.stringify(owner));

    if (player?.role === "Protector") {
      io.to("evilmans").emit("item:canceled", JSON.stringify(player));
    }

    player.cancelCooldown = DEFAULT_CANCEL_COOLDOWN;
    game.state.items = game.state.items.filter((item) => item.id !== itemId);
  }
}
