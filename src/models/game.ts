import { Socket } from "socket.io";
import { GameState } from "./gamestate";
import { Player } from "./player";
import { map } from "../../assets/map.json";
import { Config } from "./config";
import unityMap from "../../assets/unityMap.json";

export class Game {
  state: GameState;
  sockets: Record<string, Socket | undefined>;
  players: Record<string, Player>;
  config: Config;

  constructor() {
    this.state = {
      loops: 0,
      startTimer: 5,
      timer: 300,
      status: "LOBBY",
      items: [],
      map,
    };
    this.sockets = {};
    this.players = {};
    this.config = {
      tickRate: 20,
    };
  }

  get evilmans() {
    return Object.values(this.players).filter(
      (player) => player.role === "Evilman",
    );
  }

  get protectors() {
    return Object.values(this.players).filter(
      (player) => player.role === "Protector",
    );
  }

  get unitys() {
    return Object.values(this.players).filter(
      (player) => player.type === "UNITY",
    );
  }

  get webplayers() {
    return Object.values(this.players).filter(
      (player) => player.type === "WEB",
    );
  }

  reset() {
    this.state.status = "LOBBY";
    this.state.startTimer = 5;
    this.state.timer = 300;
    this.players = {};
    this.sockets = {};
  }

  win_reset() {
    this.state.status = "STARTING";
    this.state.startTimer = 5;
    this.state.timer = 300;
    this.state.loops += 1;
    console.info("Player has won for the n°" + this.state.loops + " time !");
  }

  tick() {
    if (this.state.status === "STARTING") {
      this.state.startTimer = Math.max(
        0,
        this.state.startTimer - 1 / this.config.tickRate,
      );

      if (this.state.startTimer === 0) {
        this.state.status = "PLAYING";
        this.unitys.forEach((player) => {
          const socket = this.sockets[player.id];
          socket?.emit("go", JSON.stringify({ unityMap }));
        });
      }
    }

    if (this.state.status === "PLAYING") {
      this.state.timer -= 1 / this.config.tickRate;

      this.evilmans.forEach((player) => {
        const socket = this.sockets[player.id];
        socket?.emit("playerInfo", JSON.stringify(player));
      });

      this.protectors.forEach((player) => {
        const socket = this.sockets[player.id];
        socket?.emit("playerInfo", JSON.stringify(player));
      });

      this.unitys.forEach((player) => {
        const socket = this.sockets[player.id];
        socket?.emit("playerInfo", JSON.stringify(player));
      });

      this.state.items.forEach((item) => {
        // update item cooldowns, casting time and duration
        item.reduceTimers(1 / this.config.tickRate);
        if (item.duration <= 0) {
          this.state.items = this.state.items.filter((i) => i.id !== item.id);
        }
      });
    }
    if (this.state.timer <= 0) {
      this.state.status = "FINISHED";
    }
    if (this.state.status === "DEAD") {
      // gonna teleport the dead player to the spawn point
      console.info("Player has been killed");
    }

    if (this.state.status === "WON") {
      this.win_reset();
    }
  }

  addPlayer(player: Player) {
    this.players[player.id] = player;
  }

  setSocket(player: Player, socket: Socket) {
    this.sockets[player.id] = socket;
  }

  getPlayer(id: string) {
    return Object.values(this.players).find((player) => player.id === id);
  }
}
