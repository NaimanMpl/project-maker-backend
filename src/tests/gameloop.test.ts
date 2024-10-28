import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { SpellEnum, SpellFactory } from "../factories/spell.factory";
import * as mapLoader from "../loaders/map.loader";
import { GameState } from "../models/gamestate";
import { Coin } from "../models/items/coin.item";
import { Player, PlayerRole } from "../models/player";
import { game, io, server } from "../server";
import { PLAYER_MOCK, UNITY_PLAYER_MOCK } from "./__fixtures__/player";
import { FreezeItem } from "../models/items/freeze.item";

describe("GameLoop", () => {
  let clientSocket: ClientSocket;
  let serverSocket: ServerSocket;

  beforeEach((done) => {
    game.reset();
    server.listen(3001, () => {
      io.on("connection", (socket) => {
        serverSocket = socket;
      });

      clientSocket = ioc("http://localhost:3001");
      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    clientSocket.close();
    server.close();
    io.close();
  });

  it("should capture and send gamestate to clients at each tick", (done) => {
    clientSocket.on("gamestate", (msg) => {
      const gamestate: GameState = JSON.parse(msg);

      expect(gamestate.status).toEqual("LOBBY");
      expect(gamestate.timer).toEqual(300);
      expect(gamestate.startTimer).toEqual(5);
      expect(gamestate.loops).toEqual(0);

      done();
    });
  });

  it("should update gamestate according to the tick rate", () => {
    expect(game.state.status).toBe("LOBBY");
    expect(game.state.timer).toBe(300);
    expect(game.state.loops).toBe(0);

    game.state.status = "PLAYING";
    game.tick();

    expect(game.state.status).toBe("PLAYING");
    expect(game.state.loops).toBe(0);
    expect(game.state.timer).toBe(299.95); // (1 / tickRate) = 1 / 20 = 0.05
  });

  it("should update start timer on each tick when starting", () => {
    game.state.status = "STARTING";

    expect(game.state.startTimer).toBe(5);

    game.tick();

    expect(game.state.startTimer).toBe(4.95);
  });

  it("should emit a go message for unity players when start timer equals 0", (done) => {
    game.state.status = "LOBBY";
    game.state.map = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const unityPlayer = {
      name: "John",
      type: "UNITY",
    };
    clientSocket.emit("signup", JSON.stringify(unityPlayer));

    clientSocket.on("signupsuccess", () => {
      game.state.status = "STARTING";
      game.state.startTimer = 0;
    });

    clientSocket.on("go", (message) => {
      expect(JSON.parse(message)).toHaveProperty("unityMap");
    });

    clientSocket.on("map", (message) => {
      const { map }: { map: number[][] } = JSON.parse(message);
      expect(map).toEqual([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
      done();
    });
  });

  it("should send unity player status to every client connected", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Evilman",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.state.status = "PLAYING";
    game.addPlayer({ ...UNITY_PLAYER_MOCK });
    game.addPlayer(player);
    game.setSocket(player, serverSocket);

    const socket = game.sockets[player.id];
    if (!socket) {
      fail();
    }
    const spy = jest.spyOn(io, "emit");

    game.tick();
    expect(spy).toHaveBeenCalledWith(
      "player:unity",
      JSON.stringify({
        id: "2",
        name: "John",
        type: "UNITY",
        spells: [],
        speed: 10,
        coins: 0,
        items: [],
        credits: 0,
        health: 100,
      }),
    );
  });

  it("should send personal player status to each protectors at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Protector",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.state.status = "PLAYING";
    game.addPlayer(player);
    game.setSocket(player, serverSocket);

    const socket = game.sockets[player.id];
    if (!socket) {
      fail();
    }
    const spy = jest.spyOn(socket, "emit");

    game.tick();
    expect(spy).toHaveBeenCalledWith(
      "playerInfo",
      JSON.stringify({
        id: "1",
        name: "John",
        type: "WEB",
        role: "Protector",
        spells: [],
        coins: 0,
        items: [],
        credits: 0,
        health: 100,
      }),
    );
  });

  it("should send personal player status to each unity players at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.state.status = "PLAYING";
    game.addPlayer(player);
    game.setSocket(player, serverSocket);

    const socket = game.sockets[player.id];
    if (!socket) {
      fail();
    }
    const spy = jest.spyOn(socket, "emit");

    game.tick();
    expect(spy).toHaveBeenCalledWith(
      "playerInfo",
      JSON.stringify({
        id: "1",
        name: "John",
        type: "UNITY",
        spells: [],
        coins: 0,
        items: [],
        credits: 0,
        health: 100,
      }),
    );
  });

  it("should update spell cooldown (Protector) on next tick.", () => {
    const playerRole: PlayerRole = "Protector";
    const player = { ...PLAYER_MOCK, role: playerRole };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(39.95);
  });

  it("should update spell cooldown (Evilman) on next tick.", () => {
    const playerRole: PlayerRole = "Evilman";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(39.95);
  });

  it("should reset the cooldown of a spell", () => {
    const playerRole: PlayerRole = "Evilman";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    player.spells[0].currentCooldown = 0.05;

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(0);

    slowSpell.cast(unityPlayer);
    expect(player.spells[0].currentCooldown).toEqual(40);
  });

  it("should reset the cooldown of a spell", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    player.spells[0].currentCooldown = 0.05;

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(0);

    slowSpell.cast(unityPlayer);
    expect(player.spells[0].currentCooldown).toEqual(40);
  });

  it("should decrement timer on next tick.", () => {
    const playerRole: PlayerRole = "Evilman";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";

    expect(player.spells[0].duration).toEqual(5);
    expect(player.spells[0].timer).toEqual(5);
    expect(player.spells[0].active).toEqual(false);

    slowSpell.cast(unityPlayer);
    game.tick();
    expect(player.spells[0].active).toEqual(true);
    expect(player.spells[0].timer).toEqual(4.95);
  });

  it("should decrement timer on next tick.", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";

    expect(player.spells[0].duration).toEqual(5);
    expect(player.spells[0].timer).toEqual(5);
    expect(player.spells[0].active).toEqual(false);

    slowSpell.cast(unityPlayer);
    game.tick();
    expect(player.spells[0].active).toEqual(true);
    expect(player.spells[0].timer).toEqual(4.95);
  });

  it("should reset the timer when duration is over", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);
    const slowSpell = SpellFactory.createSpell(SpellEnum.SlowMode);
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    player.spells[0].timer = 0.05;
    expect(unityPlayer.speed).toEqual(5);

    game.tick();
    expect(player.spells[0].active).toEqual(false);
    expect(player.spells[0].timer).toEqual(5);
    expect(unityPlayer.speed).toEqual(10);

    game.tick();
    expect(player.spells[0].active).toEqual(false);
    expect(player.spells[0].timer).toEqual(5);
  });

  it("should update items cooldown on each tick", () => {
    const coin = new Coin({ x: 0, y: 0, z: 0 });
    coin.duration = 1000;
    coin.currentCooldown = 30;
    game.state.items = [coin];
    game.state.status = "PLAYING";

    game.tick();
    expect(coin.duration).toEqual(999.95);
    expect(coin.currentCooldown).toEqual(29.95);
    expect(coin.castingTime).toEqual(0.95);
  });

  it("should update special items cooldown on each tick", () => {
    const freezeItem = new FreezeItem();
    freezeItem.currentCooldown = 30;
    freezeItem.casted = true;
    game.state.status = "PLAYING";
    game.addPlayer({ ...PLAYER_MOCK, specialItems: [freezeItem] });

    game.tick();
    expect(freezeItem.currentCooldown).toEqual(29.95);
  });

  it("should destroy items on next tick if their duration is under 0", () => {
    const coin = new Coin({ x: 0, y: 0, z: 0 });
    coin.duration = 0.05;
    game.state.items = [coin];
    game.state.status = "PLAYING";

    game.tick();
    expect(coin.duration).toEqual(0);
    expect(game.state.items).toHaveLength(0);
  });

  it("should trigger coin on next tick if an unity player is on the item", () => {
    const coin = new Coin({ x: 0, y: 0, z: 0 });
    coin.duration = 1;
    game.state.items = [coin];
    game.state.status = "PLAYING";
    game.addPlayer({
      ...UNITY_PLAYER_MOCK,
      position: { x: 0, y: 0, z: 0 },
      credits: 0,
      health: 100,
    });

    expect(game.unitys[0].coins).toEqual(0);
    game.tick();
    expect(game.unitys[0].coins).toEqual(1);
  });

  it("should stop the unity player when spell is casted", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);

    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);

    const suddenStopSpell = SpellFactory.createSpell(SpellEnum.SuddenStop);
    game.addSpell(player, suddenStopSpell);
    game.state.status = "PLAYING";

    suddenStopSpell.cast(unityPlayer);
    expect(unityPlayer.speed).toEqual(0);
  });

  it("should reset unity player speed after the duration", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);

    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);

    const suddenStopSpell = SpellFactory.createSpell(SpellEnum.SuddenStop);
    game.addSpell(player, suddenStopSpell);

    game.state.status = "PLAYING";
    suddenStopSpell.cast(unityPlayer);

    player.spells[0].timer = 0.05;
    expect(unityPlayer.speed).toEqual(0);
    expect(player.spells[0].active).toEqual(true);

    game.tick();
    expect(player.spells[0].active).toEqual(false);
    expect(player.spells[0].timer).toEqual(2);
    expect(unityPlayer.speed).toEqual(10);
    expect(player.spells[0].currentCooldown).toEqual(29.95);
  });

  it("should remake the unity player walk normally", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);

    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);

    const quicknessSpell = SpellFactory.createSpell(SpellEnum.Quickness);
    game.addSpell(player, quicknessSpell);

    game.state.status = "PLAYING";
    quicknessSpell.cast(unityPlayer);

    player.spells[0].timer = 0.05;
    expect(unityPlayer.speed).toEqual(15);
    expect(player.spells[0].active).toEqual(true);

    game.tick();
    expect(player.spells[0].active).toEqual(false);
    expect(player.spells[0].timer).toEqual(5);
    expect(unityPlayer.speed).toEqual(10);
    expect(player.spells[0].currentCooldown).toEqual(19.95);
  });

  it("should update loop if unity player is in a winnable state", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");
    const mapLoaderSpy = jest.spyOn(mapLoader, "loadMap");
    game.state.status = "PLAYING";
    const unityPlayer = {
      ...UNITY_PLAYER_MOCK,
      position: { x: 10, y: 10, z: 0 },
    };
    game.addPlayer(unityPlayer);
    game.addPlayer({
      id: "1234",
      name: "John",
      type: "WEB",
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    });

    const webPlayer = game.getPlayer("1234");
    game.addSpell(webPlayer, SpellFactory.createSpell(SpellEnum.SlowMode));
    game.addSpell(webPlayer, SpellFactory.createSpell(SpellEnum.SuddenStop));
    game.addSpell(webPlayer, SpellFactory.createSpell(SpellEnum.Quickness));
    game.addSpell(webPlayer, SpellFactory.createSpell(SpellEnum.DrunkMode));

    game.currentTick = 20;

    game.tick();
    expect(game.state.loops).toEqual(1);
    expect(game.unitys[0].position).toEqual({ x: 10, y: 10, z: 0 });
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "win",
      JSON.stringify({
        id: "2",
        name: "John",
        type: "UNITY",
        spells: [],
        speed: 10,
        coins: 0,
        items: [],
        credits: 0,
        health: 100,
        position: {
          x: 10,
          y: 10,
          z: 0,
        },
      }),
    );

    expect(mapLoaderSpy).toHaveBeenCalled();
    const suddenStopSpell = webPlayer.spells.find(
      (spell) => spell.name === "Sudden Stop",
    );
    const slowmodeSpell = webPlayer.spells.find(
      (spell) => spell.name === "Slow Mode",
    );
    const quicknessSpell = webPlayer.spells.find(
      (spell) => spell.name === "Quickness",
    );
    const drunkmodeSpell = webPlayer.spells.find(
      (spell) => spell.name === "Drunk Mode",
    );

    expect(slowmodeSpell?.duration).toEqual(5);
    expect(slowmodeSpell?.currentCooldown).toEqual(0);
    expect(slowmodeSpell?.timer).toEqual(0);
    expect(suddenStopSpell?.duration).toEqual(2);
    expect(suddenStopSpell?.currentCooldown).toEqual(0);
    expect(suddenStopSpell?.timer).toEqual(0);
    expect(quicknessSpell?.duration).toEqual(5);
    expect(quicknessSpell?.currentCooldown).toEqual(0);
    expect(quicknessSpell?.timer).toEqual(0);
    expect(drunkmodeSpell?.duration).toEqual(7);
    expect(drunkmodeSpell?.currentCooldown).toEqual(0);
    expect(drunkmodeSpell?.timer).toEqual(0);
  });

  it("should update the gamestate to FINISHED when the timer equals 0 and reset the game", () => {
    game.state.timer = 0.01;
    game.state.status = "PLAYING";
    game.tick();

    expect(game.state.status).toEqual("FINISHED");
    expect(game.state.finishedTimer).toEqual(5);

    game.tick();
    expect(game.state.finishedTimer).toEqual(4.95);

    game.state.finishedTimer = 0.01;
    game.tick();

    expect(game.state.status).toEqual("LOBBY");
    expect(game.state.startTimer).toEqual(5);
    expect(game.state.finishedTimer).toEqual(5);
    expect(game.state.timer).toEqual(300);
    expect(game.players).toEqual({});
    expect(game.sockets).toEqual({});
    expect(game.currentTick).toEqual(0);
  });

  it("should update special items if some players have one", () => {
    const freezeItem = new FreezeItem();
    freezeItem.casted = true;
    game.addPlayer({ ...PLAYER_MOCK, specialItems: [freezeItem] });
    game.state.status = "PLAYING";
    game.tick();

    const player = game.getPlayer("1");
    expect(player.specialItems?.[0].duration).toEqual(4.95);
  });

  it("should deactivate special items on update if duration is over according to the team", () => {
    const freezeItem = new FreezeItem();
    freezeItem.duration = 0.05;
    freezeItem.casted = true;
    game.addPlayer({
      ...PLAYER_MOCK,
      specialItems: [freezeItem],
      role: "Evilman",
    });
    game.addPlayer({
      ...PLAYER_MOCK,
      id: "2",
      name: "Dummy",
      blind: true,
      specialItems: [freezeItem],
      role: "Protector",
    });

    const player = game.getPlayer("1");
    freezeItem.owner = { ...player, specialItems: undefined };

    game.state.status = "PLAYING";
    game.tick();

    const protector = game.getPlayer("2");
    expect(protector.blind).toEqual(false);
  });

  it("should deactivate special items on update if duration is over according to the team", () => {
    const freezeItem = new FreezeItem();
    freezeItem.duration = 0.05;
    freezeItem.casted = true;
    game.addPlayer({
      ...PLAYER_MOCK,
      specialItems: [freezeItem],
      role: "Protector",
    });
    game.addPlayer({
      ...PLAYER_MOCK,
      id: "2",
      name: "Dummy",
      blind: true,
      specialItems: [freezeItem],
      role: "Evilman",
    });

    const player = game.getPlayer("1");
    freezeItem.owner = { ...player, specialItems: undefined };

    game.state.status = "PLAYING";
    game.tick();

    const evilman = game.getPlayer("2");
    expect(evilman.blind).toEqual(false);
  });

  it("should make the unity player drunk when the spell is cast", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);

    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      vision: true,
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);

    const drunkmodeSpell = SpellFactory.createSpell(SpellEnum.DrunkMode);
    game.addSpell(player, drunkmodeSpell);
    drunkmodeSpell.cast(unityPlayer);

    expect(unityPlayer.vision).toEqual(false);
  });

  it("should make the unity player sober", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
      speed: 10,
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    };
    game.addPlayer(player);

    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
      vision: true,
      credits: 0,
      health: 100,
    };
    game.addPlayer(unityPlayer);

    const drunkmodeSpell = SpellFactory.createSpell(SpellEnum.DrunkMode);
    game.addSpell(player, drunkmodeSpell);

    game.state.status = "PLAYING";
    drunkmodeSpell.cast(unityPlayer);

    player.spells[0].timer = 0.05;
    expect(unityPlayer.vision).toEqual(false);

    game.tick();
    expect(unityPlayer.vision).toEqual(true);
    expect(player.spells[0].timer).toEqual(7);
    expect(player.spells[0].currentCooldown).toEqual(24.95);
  });

  it("should make the player die if his health is under 0", () => {
    const emitSpy = jest.spyOn(serverSocket, "emit");

    const unityPlayer = { ...UNITY_PLAYER_MOCK, health: 0 };
    game.state.status = "PLAYING";
    game.addPlayer(unityPlayer);
    game.sockets[unityPlayer.id] = serverSocket;
    game.tick();

    expect(unityPlayer.health).toEqual(1);
    expect(unityPlayer.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(emitSpy).toHaveBeenCalledWith(
      "unity:position",
      JSON.stringify({ x: 0, y: 0, z: 0 }),
    );
  });

  it("should update the player credits and cancelCooldown", () => {
    game.addPlayer({ ...PLAYER_MOCK, cancelCooldown: 10 });
    game.state.status = "PLAYING";
    const player = game.getPlayer("1");
    game.tick();

    expect(player.cancelCooldown).toEqual(9.95);
    expect(player.credits).toEqual(0.05);
  });

  it("should generate items when item timer under 0 accordint to the state loops", () => {
    game.state.status = "PLAYING";
    game.state.itemTimer = 0;

    game.state.loops = 22;

    game.tick();

    expect(game.state.items).toHaveLength(4);
  });
});
