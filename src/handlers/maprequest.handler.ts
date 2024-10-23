import { game } from "../server";
import { MessageHandler } from "./handler";

export class MapRequestHandler extends MessageHandler {
  handleMessage(_: string): void {
    const map = game.state.map;
    this.socket.emit("map", JSON.stringify({ map }));
  }
}
