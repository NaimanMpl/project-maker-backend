import { DEV_MODE_NOT_ENABLED } from "../models/gameerror";
import { game } from "../server";
import { MessageHandler } from "./handler";

export class RestartHandler extends MessageHandler {
  handleMessage(_: string): void {
    if (process.env.DEV_MODE !== "enabled") {
      this.socket.emit("error", JSON.stringify(DEV_MODE_NOT_ENABLED));
      return;
    }

    game.reset();
  }
}
