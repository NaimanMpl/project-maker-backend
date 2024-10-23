import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { PLAYER_MOCK } from "../__fixtures__/player";
import { GameError } from "../../models/gameerror";
import { Coin } from "../../models/items/coin.item";

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

  it("should create a new item", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });

    clientSocket.emit(
      "cast:item",
      JSON.stringify({
        item: "COIN",
        x: 0,
        y: 0,
        id: "1",
      }),
    );

    serverSocket.on("cast:item", () => {
      expect(game.state.items).toHaveLength(1);
      expect(game.state.items[0].type).toEqual("COIN");
      expect(game.state.items[0].id).toEqual("123456789");
      expect(game.state.items[0].ownerId).toEqual("1");
      expect(game.state.items[0].coords).toEqual({ x: 0, y: 0, z: 0 });
      done();
    });
  });

  it("should error if the player does not exists", (done) => {
    clientSocket.emit(
      "cast:item",
      JSON.stringify({
        item: "COIN",
        x: 0,
        y: 0,
        id: "1",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "NOT_A_PLAYER",
        message: "You're not in the players list.",
      });
      done();
    });
  });

  it("should error if the item does not exists", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });

    clientSocket.emit(
      "cast:item",
      JSON.stringify({
        item: "UNKNOWN_ITEM",
        x: 0,
        y: 0,
        id: "1",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "UNKNOWN_ITEM",
        message: "The following item is unknown.",
      });
      done();
    });
  });

  it("should error if the item is already on cooldown", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });
    const coin = new Coin({ x: 0, y: 0, z: 0 });
    coin.ownerId = "1";
    game.state.items = [coin];

    clientSocket.emit(
      "cast:item",
      JSON.stringify({
        item: "COIN",
        x: 0,
        y: 0,
        id: "1",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "ITEM_ON_COOLDOWN",
        message: "The item is on cooldown.",
      });
      done();
    });
  });
});
