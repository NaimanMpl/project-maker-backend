import { Socket } from "socket.io";
import { map } from "../../assets/mazeArray.json";
import unityMap from "../../assets/unityMap.json";
import { SpellEnum, SpellFactory } from "../factories/spell.factory";
import { io } from "../server";
import { Config } from "./config";
import { GameState } from "./gamestate";
import { Player } from "./player";
import { Spell } from "./spell";
import * as mapLoader from "../loaders/map.loader";

export class Game {
  state: GameState;
  sockets: Record<string, Socket | undefined>;
  players: Record<string, Player>;
  config: Config;
  dev: boolean;
  unityMap: object;
  currentTick: number;
  winTick: number;

  constructor() {
    this.state = {
      loops: 0,
      timer: 5 * 60,
      startTimer: 5,
      finishedTimer: 5,
      status: "LOBBY",
      items: [],
      map,
      startPoint: {
        type: "Start",
        properties: {
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      },
      endPoint: {
        type: "Start",
        properties: {
          position: {
            x: 10,
            y: 10,
            z: 0,
          },
        },
      },
    };
    this.unityMap = unityMap;
    this.sockets = {};
    this.players = {};
    this.config = {
      tickRate: 20,
    };
    this.dev = process.env.DEV_MODE === "enabled";
    this.winTick = 0;
    this.currentTick = 0;
    this.loadMap();
  }
  loadMap() {
    mapLoader.loadMap().then((mapData) => {
      const { map, start, end, unityMap } = mapData;
      this.state.startPoint = start;
      this.state.endPoint = end;
      this.state.map = map;
      this.unityMap = unityMap;
      this.state.items = [];
      this.unitys.forEach((player) => {
        const socket = this.sockets[player.id];
        player.position = {
          x: start.properties.position.x,
          y: start.properties.position.y,
          z: start.properties.position.z,
        };
        socket?.emit("unity:position", player.position);
      });
      io.emit("map", JSON.stringify({ map }));
      io.emit("unity:map", JSON.stringify({ unityMap }));
    });
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
    this.winTick = 0;
    this.currentTick = 0;
    this.state = {
      loops: 0,
      timer: 5 * 60,
      finishedTimer: 5,
      startTimer: 5,
      status: "LOBBY",
      items: [],
      map,
      startPoint: {
        type: "Start",
        properties: {
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      },
      endPoint: {
        type: "Start",
        properties: {
          position: {
            x: 10,
            y: 10,
            z: 0,
          },
        },
      },
    };
  }

  tick() {
    this.currentTick++;
    if (this.state.status === "STARTING") {
      this.state.startTimer = Math.max(
        0,
        this.state.startTimer - 1 / this.config.tickRate,
      );

      if (this.state.startTimer === 0) {
        this.state.status = "PLAYING";
        this.unitys.forEach((player) => {
          const socket = this.sockets[player.id];
          socket?.emit("go", JSON.stringify({ unityMap: this.unityMap }));
        });
        io.emit("map", JSON.stringify({ map: this.state.map }));
        this.webplayers.forEach((webPlayer) => {
          webPlayer.spells.push(SpellFactory.createSpell(SpellEnum.SlowMode));
          webPlayer.spells.push(SpellFactory.createSpell(SpellEnum.SuddenStop));
        });
      }
    }

    if (this.state.status === "FINISHED") {
      this.state.finishedTimer = Math.max(
        0,
        this.state.finishedTimer - 1 / this.config.tickRate,
      );

      if (this.state.finishedTimer <= 0) {
        this.reset();
      }
    }

    if (this.state.status === "PLAYING") {
      this.state.timer = Math.max(
        0,
        this.state.timer - 1 / this.config.tickRate,
      );

      if (this.state.timer <= 0) {
        this.state.status = "FINISHED";
        return;
      }

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

      this.state.items.forEach((item) => {
        this.unitys.forEach((player) => {
          if (player.position) {
            if (
              Math.abs(item.coords.x - player.position?.x) <= 0.3 &&
              Math.abs(item.coords.y - player.position?.y) <= 0.3
            ) {
              item.trigger(player);
            }
          }
        });

        item.update(1 / this.config.tickRate);
      });

      this.checkWin();
    }
  }

  checkWin() {
    this.unitys.forEach((player) => {
      if (!player.position) {
        return;
      }
      if (this.state.endPoint && this.currentTick - this.winTick > 20) {
        if (
          Math.abs(
            player.position.x - this.state.endPoint.properties.position.x,
          ) <= 0.3 &&
          Math.abs(
            player.position.y - this.state.endPoint.properties.position.y,
          ) <= 0.3
        ) {
          io.emit("win", JSON.stringify(player));

          this.state.loops++;
          this.state.items = [];
          this.state.timer = 5 * 60;
          this.webplayers.forEach((webplayer) => {
            webplayer.spells.forEach((spell) => {
              spell.spellReset();
            });
          });
          this.state.endPoint = undefined;
          this.state.startPoint = undefined;
          this.loadMap();
          this.winTick = this.currentTick;
        }
      }
    });
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
