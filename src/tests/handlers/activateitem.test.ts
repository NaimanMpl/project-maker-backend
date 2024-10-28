import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { GameError } from "../../models/gameerror";
import { PLAYER_MOCK } from "../__fixtures__/player";
import { waitForServer } from "../utils";
import { FreezeItem } from "../../models/items/freeze.item";

describe("Activate Item Handler", () => {
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

  it("should activate the item to the protectors if the caster is an evilman", async () => {
    game.addPlayer({
      ...PLAYER_MOCK,
      role: "Evilman",
      specialItems: [new FreezeItem()],
    });
    game.addPlayer({
      ...PLAYER_MOCK,
      id: "2",
      name: "Dummy",
      role: "Protector",
      specialItems: [],
    });
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "FREEZE",
      }),
    );

    await waitForServer(serverSocket, "item:activate");
    const protector = game.getPlayer("2");
    expect(protector.blind).toEqual(true);
  });

  it("should activate the item to the evilmans if the caster is a protector", async () => {
    game.addPlayer({
      ...PLAYER_MOCK,
      role: "Protector",
      specialItems: [new FreezeItem()],
    });
    game.addPlayer({
      ...PLAYER_MOCK,
      id: "2",
      name: "Dummy",
      role: "Evilman",
      specialItems: [],
    });
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "FREEZE",
      }),
    );

    await waitForServer(serverSocket, "item:activate");
    const evilman = game.getPlayer("2");
    expect(evilman.blind).toEqual(true);
  });

  it("should error if the item is on cooldown", (done) => {
    const freezeItem = new FreezeItem();
    freezeItem.currentCooldown = 30;
    game.addPlayer({
      ...PLAYER_MOCK,
      role: "Evilman",
      specialItems: [freezeItem],
    });
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "FREEZE",
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

  it("should error if the player does not have the special item", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "FREEZE",
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

  it("should error if the player is unknown", (done) => {
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "FREEZE",
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

  it("should error if the item is unknown", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "UNKNOWN",
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

  it("should error if the player is blind", (done) => {
    game.addPlayer({ ...PLAYER_MOCK, blind: true });
    clientSocket.emit(
      "item:activate",
      JSON.stringify({
        id: "1",
        item: "UNKNOWN",
      }),
    );

    clientSocket.on("error", (message) => {
      const error: GameError = JSON.parse(message);
      expect(error).toEqual({
        type: "UNAUTHORIZED",
        message: "You cannot perform this action.",
      });
      done();
    });
  });
});
