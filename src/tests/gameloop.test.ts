import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameState } from "../models/gamestate";
import { Player, PlayerRole } from "../models/player";
import { SlowModeSpell } from "../models/spells/slowmode.spell";
import { game, io, server } from "../server";
import { PLAYER_MOCK, UNITY_PLAYER_MOCK } from "./__fixtures__/player";

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
      expect(gamestate.timer).toEqual(0);
      expect(gamestate.startTimer).toEqual(5);
      expect(gamestate.loops).toEqual(0);

      done();
    });
  });

  it("should update gamestate according to the tick rate", () => {
    expect(game.state.status).toBe("LOBBY");
    expect(game.state.timer).toBe(0);
    expect(game.state.loops).toBe(0);
    expect(game.state.timer).toBe(0);

    game.state.status = "PLAYING";
    game.tick();

    expect(game.state.status).toBe("PLAYING");
    expect(game.state.loops).toBe(0);
    expect(game.state.timer).toBe(0.05); // (1 / tickRate) = 1 / 20 = 0.05
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

  it("should send personal player status to each evilmans at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Evilman",
      spells: [],
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
        role: "Evilman",
        spells: [],
      }),
    );
  });

  it("should send unity player status to each evilmans at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Evilman",
      spells: [],
    };
    game.state.status = "PLAYING";
    game.addPlayer({ ...UNITY_PLAYER_MOCK });
    game.addPlayer(player);
    game.setSocket(player, serverSocket);

    const socket = game.sockets[player.id];
    if (!socket) {
      fail();
    }
    const spy = jest.spyOn(socket, "emit");

    game.tick();
    expect(spy).toHaveBeenCalledWith(
      "player:unity",
      JSON.stringify({
        id: "2",
        name: "John",
        type: "UNITY",
        spells: [],
        speed: 10,
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
      }),
    );
  });

  it("should send unity player status to each protectors at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Protector",
      spells: [],
    };
    game.state.status = "PLAYING";
    game.addPlayer({ ...UNITY_PLAYER_MOCK });
    game.addPlayer(player);
    game.setSocket(player, serverSocket);

    const socket = game.sockets[player.id];
    if (!socket) {
      fail();
    }
    const spy = jest.spyOn(socket, "emit");

    game.tick();
    expect(spy).toHaveBeenCalledWith(
      "player:unity",
      JSON.stringify({
        id: "2",
        name: "John",
        type: "UNITY",
        spells: [],
        speed: 10,
      }),
    );
  });

  it("should send personal player status to each unity players at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "UNITY",
      spells: [],
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
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(29.95);
  });

  it("should update spell cooldown (Evilman) on next tick.", () => {
    const playerRole: PlayerRole = "Evilman";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(29.95);
  });

  it("should reset the cooldown of a spell", () => {
    const playerRole: PlayerRole = "Evilman";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    player.spells[0].currentCooldown = 0.05;

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(0);

    slowSpell.cast(unityPlayer);
    expect(player.spells[0].currentCooldown).toEqual(30);
  });

  it("should reset the cooldown of a spell", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    player.spells[0].currentCooldown = 0.05;

    game.tick();

    expect(game.state.status).toEqual("PLAYING");
    expect(player.spells[0].currentCooldown).toEqual(0);

    slowSpell.cast(unityPlayer);
    expect(player.spells[0].currentCooldown).toEqual(30);
  });

  it("should decrement timer on next tick.", () => {
    const playerRole: PlayerRole = "Evilman";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";

    expect(player.spells[0].duration).toEqual(10);
    expect(player.spells[0].timer).toEqual(10);
    expect(player.spells[0].active).toEqual(false);

    slowSpell.cast(unityPlayer);
    game.tick();
    expect(player.spells[0].active).toEqual(true);
    expect(player.spells[0].timer).toEqual(9.95);
  });

  it("should decrement timer on next tick.", () => {
    const playerRole: PlayerRole = "Protector";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: playerRole,
      spells: [],
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";

    expect(player.spells[0].duration).toEqual(10);
    expect(player.spells[0].timer).toEqual(10);
    expect(player.spells[0].active).toEqual(false);

    slowSpell.cast(unityPlayer);
    game.tick();
    expect(player.spells[0].active).toEqual(true);
    expect(player.spells[0].timer).toEqual(9.95);
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
    };
    game.addPlayer(player);
    const unityPlayer: Player = {
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    };
    game.addPlayer(unityPlayer);
    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);
    game.state.status = "PLAYING";
    slowSpell.cast(unityPlayer);

    player.spells[0].timer = 0.05;
    expect(unityPlayer.speed).toEqual(5);

    game.tick();
    expect(player.spells[0].active).toEqual(false);
    expect(player.spells[0].timer).toEqual(10);
    expect(unityPlayer.speed).toEqual(10);

    game.tick();
    expect(player.spells[0].active).toEqual(false);
    expect(player.spells[0].timer).toEqual(10);
    expect(player.spells[0].currentCooldown).toEqual(30);
  });
});
