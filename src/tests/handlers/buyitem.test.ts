import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { GameError } from "../../models/gameerror";
import { PLAYER_MOCK } from "../__fixtures__/player";
import { waitForServer } from "../utils";

describe("Buy Item Handler", () => {
  let clientSocket: ClientSocket;
  let serverSocket: ServerSocket;

  beforeAll((done) => {
    server.listen(3001, () => {
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket = ioc("http://localhost:3001");
      clientSocket.on("connect", done);
    });
  });

  beforeEach(() => {
    game.reset();
  });

  afterEach(() => {
    clientSocket.removeAllListeners();
  });

  afterAll((done) => {
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should add a special item to the player and update his balance", async () => {
    game.addPlayer({ ...PLAYER_MOCK, specialItems: [], credits: 101 });
    game.shop.costs["FREEZE"] = 100;
    clientSocket.emit(
      "shop:buy",
      JSON.stringify({
        id: "1",
        type: "FREEZE",
      }),
    );
    const player = game.getPlayer("1");
    await waitForServer(serverSocket, "shop:buy");
    expect(player.credits).toEqual(1);
    expect(player.specialItems).toHaveLength(1);
    expect(player.specialItems?.[0].type).toEqual("FREEZE");
  });

  it("should error if the player is unknown", (done) => {
    clientSocket.emit(
      "shop:buy",
      JSON.stringify({
        id: "unknown",
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

  it("should error if the item is unknown", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });
    clientSocket.emit(
      "shop:buy",
      JSON.stringify({
        id: "1",
        type: "UNKNOWN",
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

  it("should error if the item is known but not in the shop items", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });
    clientSocket.emit(
      "shop:buy",
      JSON.stringify({
        id: "1",
        type: "COIN",
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

  it("should error if the player does not have enough credits", (done) => {
    game.addPlayer({ ...PLAYER_MOCK, credits: 0 });
    clientSocket.emit(
      "shop:buy",
      JSON.stringify({
        id: "1",
        type: "FREEZE",
      }),
    );

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "NO_ENOUGH_CREDITS",
        message: "You don't have enough credits.",
      });
      done();
    });
  });
});
