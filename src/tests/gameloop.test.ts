import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameState } from "../models/gamestate";
import { game, io, server } from "../server";
import { Socket as ServerSocket } from "socket.io";
import { Player } from "../models/player";

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
      done();
    });
  });

  it("should send personal player status to each evilmans at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Evilman",
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
      }),
    );
  });

  it("should send personal player status to each protectors at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
      role: "Protector",
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
      }),
    );
  });

  it("should send personal player status to each unity players at each tick", () => {
    const player: Player = {
      id: "1",
      name: "John",
      type: "UNITY",
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
      }),
    );
  });
});
