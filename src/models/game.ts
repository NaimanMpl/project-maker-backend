import { Socket } from "socket.io";
import { map } from "../../assets/map.json";
import unityMap from "../../assets/unityMap.json";
import { SpellEnum, SpellFactory } from "../factories/spell.factory";
import { io } from "../server";
import { Config } from "./config";
import { GameState } from "./gamestate";
import { Player } from "./player";
import { Spell } from "./spell";

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
    this.state.items = [];
  }

  win_reset() {
    this.state.status = "STARTING";
    this.state.startTimer = 10;
    this.state.timer = 300;
    this.state.items = [];
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
        io.emit("map", JSON.stringify({ map: this.state.map }));
        this.webplayers.forEach((webPlayer) => {
          webPlayer.spells.push(SpellFactory.createSpell(SpellEnum.SlowMode));
          webPlayer.spells.push(SpellFactory.createSpell(SpellEnum.SuddenStop));
        });
      }
    }

    if (this.state.status === "PLAYING") {
      this.state.timer -= 1 / this.config.tickRate;

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
        if (player.position?.x === 0 && player.position?.y === 0) {
          this.state.status = "WON";
        }
      });

      this.state.items.forEach((item) => {
        this.unitys.forEach((player) => {
          if (
            item.coords.x === player.position?.x &&
            item.coords.y === player.position?.y
          ) {
            item.trigger(player);
          }
        });

        item.update(1 / this.config.tickRate);
      });
    }
    if (this.state.timer <= 0) {
      this.state.status = "FINISHED";
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
    return this.players[id];
  }

  addSpell(player: Player, spell: Spell) {
    player.spells.push(spell);
  }
}
