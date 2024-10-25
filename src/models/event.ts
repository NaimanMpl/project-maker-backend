import { game } from "../server";
import { EVENT_INTERVAL } from "./game";
import { Player } from "./player";

export type EventType = "RANDOM_NUMBER";

export type EventWinner = "Protector" | "Evilman" | "Both" | "None";

export interface EventOptions {
  type: EventType;
  timeLimit: number;
}

export abstract class Event {
  type: EventType;
  timer: number;

  constructor(options: EventOptions) {
    const { type, timeLimit } = options;
    this.type = type;
    this.timer = timeLimit;
  }

  abstract start(): void;
  abstract submitResponse(player: Player, response: number): void;
  abstract checkWin(): void;

  update(): void {
    this.timer = Math.max(0, this.timer - 1 / game.config.tickRate);
    if (this.timer <= 0) {
      this.checkWin();
      game.state.status = "PLAYING";
      game.state.eventTimer = EVENT_INTERVAL;
      game.currentEvent = undefined;
    }
  }
}
