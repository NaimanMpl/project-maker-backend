import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { PLAYER_MOCK } from "../__fixtures__/player";
import { GameError } from "../../models/gameerror";
import { Coin } from "../../models/items/coin.item";
import { Bomb } from "../../models/items/bomb.item";
import { waitForServer } from "../utils";

describe("Item Handler", () => {
  let clientSocket: ClientSocket;
  let serverSocket: ServerSocket;

  beforeEach((done) => {
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
    serverSocket.disconnect();
    server.close();
    io.close();
    game.reset();
  });

  it("should remove item of game state and broadcast to evilmans if owner is protector", (done) => {
    game.addPlayer({ ...PLAYER_MOCK, role: "Protector" });
    const ioEmitSpy = jest.spyOn(io, "to");

    const coin = new Coin({ x: 0, y: 0, z: 0 });
    coin.owner = game.getPlayer("1");
    game.state.items = [coin];

    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "123456789",
      }),
    );

    serverSocket.on("item:cancel", () => {
      expect(game.state.items).toEqual([]);
      expect(ioEmitSpy).toHaveBeenCalledWith("evilmans");
      expect(game.getPlayer("1").cancelCooldown).toEqual(10);
      done();
    });
  });

  it("should error if the item is a bomb and the password is incorrect", (done) => {
    game.addPlayer({ ...PLAYER_MOCK, role: "Protector" });

    const bomb = new Bomb({ x: 0, y: 0, z: 0 });
    bomb.owner = game.getPlayer("1");
    game.state.items = [bomb];

    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "123456789",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "WRONG_PASSWORD",
        message: "The password is incorrect.",
      });
      expect(game.getPlayer("1").blind).toEqual(true);
    });

    clientSocket.on("player:unblind", () => {
      expect(game.getPlayer("1").blind).toEqual(false);
      done();
    });
  });

  it("should remove the bomb if the password is correct", async () => {
    game.addPlayer({ ...PLAYER_MOCK, role: "Protector" });

    const ioEmitSpy = jest.spyOn(io, "to");
    const bomb = new Bomb({ x: 0, y: 0, z: 0 });
    bomb.password = "secret";
    bomb.owner = game.getPlayer("1");
    game.state.items = [bomb];

    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "123456789",
        password: "secret",
      }),
    );

    game.addPlayer({ ...PLAYER_MOCK, role: "Protector" });

    await waitForServer(serverSocket, "item:cancel");

    expect(game.state.items).toEqual([]);
    expect(ioEmitSpy).toHaveBeenCalledWith("evilmans");
    expect(game.getPlayer("1").cancelCooldown).toEqual(10);
  });

  it("should remove item of game state and broadcast to protectors if owner is evilman", (done) => {
    const ioEmitSpy = jest.spyOn(io, "to");
    game.addPlayer({ ...PLAYER_MOCK, role: "Evilman" });

    const coin = new Coin({ x: 0, y: 0, z: 0 });
    coin.owner = game.getPlayer("1");
    game.state.items = [coin];

    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "123456789",
      }),
    );

    serverSocket.on("item:cancel", () => {
      expect(game.state.items).toEqual([]);
      expect(ioEmitSpy).toHaveBeenCalledWith("protectors");
      done();
    });
  });

  it("should error if item is unknown", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });
    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "unknown",
      }),
    );

    clientSocket.on("error", (message) => {
      const error: GameError = JSON.parse(message);
      expect(error).toEqual({
        type: "UNKNOWN_ITEM",
        message: "The following item is unknown.",
      });
      done();
    });
  });

  it("should error if sender is unknown", (done) => {
    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "unknown",
        itemId: "1",
      }),
    );

    clientSocket.on("error", (message) => {
      const error: GameError = JSON.parse(message);
      expect(error).toEqual({
        type: "NOT_A_PLAYER",
        message: "You're not in the players list.",
      });
      done();
    });
  });

  it("should error if the player is blind", (done) => {
    game.addPlayer({ ...PLAYER_MOCK, blind: true });
    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "1",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "UNAUTHORIZED",
        message: "You cannot perform this action.",
      });
      done();
    });
  });

  it("should error if the player has a cancel cooldown", (done) => {
    game.addPlayer({ ...PLAYER_MOCK, blind: false, cancelCooldown: 10 });
    clientSocket.emit(
      "item:cancel",
      JSON.stringify({
        id: "1",
        itemId: "1",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "CANCEL_ON_COOLDOWN",
        message: "The cancel item is on cooldown.",
      });
      done();
    });
  });
});
