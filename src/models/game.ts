import { Socket } from "socket.io";
import { map } from "../../assets/map.json";
import unityMap from "../../assets/unityMap.json";
import { Config } from "./config";
import { GameState } from "./gamestate";
import { Player } from "./player";
import { Spell } from "./spells/spell";
import { io } from "../server";

export class Game {
  state: GameState;
  sockets: Record<string, Socket | undefined>;
  players: Record<string, Player>;
  config: Config;

  constructor() {
    this.state = {
      loops: 0,
      timer: 0,
      startTimer: 5,
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
    this.state.timer = 0;
    this.players = {};
    this.sockets = {};
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
        io.emit("map", JSON.stringify({ map: this.state.map }));
      }
    }

    if (this.state.status === "PLAYING") {
      this.state.timer += 1 / this.config.tickRate;

      this.evilmans.forEach((player) => {
        const socket = this.sockets[player.id];
        player.spells.forEach((spell) => {
          this.unitys.forEach((unityPlayer) => {
            spell.update(unityPlayer);
          });
        });
        socket?.emit("playerInfo", JSON.stringify(player));
        this.unitys.forEach((unityPlayer) => {
          socket?.emit("player:unity", JSON.stringify(unityPlayer));
        });
      });

      this.protectors.forEach((player) => {
        const socket = this.sockets[player.id];
        player.spells.forEach((spell) => {
          this.unitys.forEach((unityPlayer) => {
            spell.update(unityPlayer);
          });
        });
        socket?.emit("playerInfo", JSON.stringify(player));
        this.unitys.forEach((unityPlayer) => {
          socket?.emit("player:unity", JSON.stringify(unityPlayer));
        });
      });

      this.unitys.forEach((player) => {
        const socket = this.sockets[player.id];
        socket?.emit("playerInfo", JSON.stringify(player));
      });
    }
  }

  addPlayer(player: Player) {
    this.players[player.id] = player;
  }

  setSocket(player: Player, socket: Socket) {
    this.sockets[player.id] = socket;
  }

  getPlayer(id: string) {
    return this.players[id];
  }

  addSpell(player: Player, spell: Spell) {
    player.spells.push(spell);
  }
}
