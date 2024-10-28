import { Socket } from "socket.io";
import { map } from "../../assets/mazeArray.json";
import unityMap from "../../assets/unityMap.json";
import { io } from "../server";
import { Config } from "./config";
import { GameState } from "./gamestate";
import { DEFAULT_PLAYER_HEALTH, Player } from "./player";
import { Spell } from "./spell";
import * as mapLoader from "../loaders/map.loader";
import { RandomNumberEvent } from "../events/randomnumber.event";
import { Event } from "./event";
import { logger } from "../logger";
import { Shop } from "./shop";
import { ItemFactory } from "../factories/item.factory";

export const EVENT_INTERVAL = 30;
export const RANDOM_ITEM_SPAWN_INTERVAL = 10;

export class Game {
  state: GameState;
  sockets: Record<string, Socket | undefined>;
  players: Record<string, Player>;
  config: Config;
  dev: boolean;
  unityMap: object;
  currentTick: number;
  winTick: number;
  currentEvent?: Event;
  shop: Shop;

  constructor() {
    this.state = {
      loops: 100,
      timer: 5 * 60,
      startTimer: 5,
      itemTimer: 100 / 10,
      finishedTimer: 5,
      eventTimer: EVENT_INTERVAL,
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
    this.currentEvent = undefined;
    this.dev = process.env.DEV_MODE === "enabled";
    this.winTick = 0;
    this.currentTick = 0;
    this.shop = new Shop();
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
        socket?.emit("unity:position", JSON.stringify(player.position));
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
    this.state.itemTimer = 10 * (100 / (100 + this.state.loops));
    this.players = {};
    this.sockets = {};
    this.winTick = 0;
    this.currentTick = 0;
    this.currentEvent = undefined;
    this.state = {
      loops: 0,
      timer: 5 * 60,
      finishedTimer: 5,
      itemTimer: 10 * (100 / (100 + this.state.loops)),
      startTimer: 5,
      eventTimer: EVENT_INTERVAL,
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
    this.shop = new Shop();
  }

  tick() {
    this.currentTick++;

    if (this.currentEvent) {
      this.currentEvent.update();
    }

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

    if (this.state.status === "PLAYING" || this.state.status === "EVENT") {
      this.state.timer = Math.max(
        0,
        this.state.timer - 1 / this.config.tickRate,
      );
      this.state.eventTimer = Math.max(
        0,
        this.state.eventTimer - 1 / this.config.tickRate,
      );

      this.state.itemTimer = Math.max(
        0,
        this.state.itemTimer - 1 / this.config.tickRate,
      );

      if (this.state.itemTimer <= 0) {
        // random between bomb and coin and wall with ratio of 6:3:1
        const Number_of_elements = this.state.loops / 10 + 1;
        for (let i = 0; i < Number_of_elements; i++) {
          const type =
            Math.random() < 0.6
              ? "BOMB"
              : Math.random() < 0.75
                ? "COIN"
                : "WALL";
          logger.info("Item placing " + type + " .... ");
          this.state.itemTimer = 10 * (100 / (100 + this.state.loops));
          ItemFactory.place_one_at_random(this.state.map, type);
          logger.info("Item " + type + " placed");
          logger.info(
            "Loop ratio for timer item " +
              10 * (100 / (100 + this.state.loops)),
          );
        }
      }

      if (this.state.timer <= 0) {
        this.state.status = "FINISHED";
        return;
      }

      if (this.state.eventTimer <= 0 && !this.currentEvent) {
        this.state.status = "EVENT";
        this.currentEvent = new RandomNumberEvent({ min: 1, max: 100 });
        this.state.currentEvent = this.currentEvent;
        this.currentEvent.start();
        logger.info(
          `Un nouvel évènement de type ${this.currentEvent.type} a commencé`,
        );
      }

      this.evilmans.forEach((player) => {
        const socket = this.sockets[player.id];
        player.spells.forEach((spell) => {
          this.unitys.forEach((unityPlayer) => {
            spell.update(unityPlayer);
          });
        });
        socket?.emit("playerInfo", JSON.stringify(player));
      });

      this.protectors.forEach((player) => {
        const socket = this.sockets[player.id];
        player.spells.forEach((spell) => {
          this.unitys.forEach((unityPlayer) => {
            spell.update(unityPlayer);
          });
        });
        socket?.emit("playerInfo", JSON.stringify(player));
        io.emit("player:unity", JSON.stringify(player));
      });

      this.unitys.forEach((player) => {
        const socket = this.sockets[player.id];

        this.state.items.forEach((item) => {
          if (player.position) {
            if (
              Math.abs(item.coords.x - player.position.y + 0.25) <= 0.75 &&
              Math.abs(item.coords.y - player.position.x + 0.25) <= 0.75
            ) {
              io.emit("item:trigger", JSON.stringify(item.type));
              item.trigger(player);
              logger.info(`Player ${player.name} triggered item ${item.type}`);
            }
          }
        });

        if (player.health <= 0 && this.state.startPoint) {
          logger.info("Player died");
          player.position = {
            x: this.state.startPoint.properties.position.x,
            y: this.state.startPoint.properties.position.y,
            z: this.state.startPoint.properties.position.z,
          };
          socket?.emit("unity:position", JSON.stringify(player.position));
          player.health = DEFAULT_PLAYER_HEALTH;
          logger.info("Player respawned", player.position);
        }
        socket?.emit("playerInfo", JSON.stringify(player));
        io.emit("player:unity", JSON.stringify(player));
      });

      this.state.items.forEach((item) => {
        item.update(1 / this.config.tickRate);
      });

      this.webplayers.forEach((player) => {
        player.credits += 1 / this.config.tickRate;
        if (player.cancelCooldown && player.cancelCooldown > 0) {
          player.cancelCooldown = Math.max(
            0,
            player.cancelCooldown - 1 / this.config.tickRate,
          );
        }
        if (player.specialItems) {
          player.specialItems.forEach((item) => {
            item.update(1 / this.config.tickRate);
          });
        }
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
            player.position.x -
              this.state.endPoint.properties.position.x +
              0.25,
          ) <= 0.75 &&
          Math.abs(
            player.position.y -
              this.state.endPoint.properties.position.y +
              0.25,
          ) <= 0.75
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
