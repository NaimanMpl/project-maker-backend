import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameError } from "../../models/gameerror";
import { Player } from "../../models/player";
import { game, io, server } from "../../server";

describe("Who Am I Handler", () => {
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    server.listen(3001, () => {
      clientSocket = ioc("http://localhost:3001");
      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    clientSocket.removeAllListeners();
  });

  afterAll((done) => {
    game.reset();
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should return back the player according to the id provided", (done) => {
    game.addPlayer({
      id: "123456789",
      name: "John",
      type: "WEB",
      spells: [],
      coins: 0,
      items: [],
    });

    clientSocket.emit(
      "whoami",
      JSON.stringify({
        id: "123456789",
      }),
    );

    clientSocket.on("playerInfo", (message) => {
      const player: Player = JSON.parse(message);
      expect(player).toEqual({
        id: "123456789",
        name: "John",
        type: "WEB",
        spells: [],
        coins: 0,
        items: [],
      });
      done();
    });
  });

  it("should return back the player according to the id provided", (done) => {
    game.addPlayer({
      id: "123456789",
      name: "John",
      type: "WEB",
      spells: [],
      coins: 0,
      items: [],
    });

    clientSocket.emit(
      "whoami",
      JSON.stringify({
        id: "123",
      }),
    );

    clientSocket.on("error", (message) => {
      const error: GameError = JSON.parse(message);
      expect(error).toEqual({
        type: "UNKNOWN_PLAYER",
        message: "The player was not found.",
      });
      done();
    });
  });

  it("should return back the player according to the id provided even if state is not LOBBY", (done) => {
    game.state.status = "PLAYING";
    game.addPlayer({
      id: "1",
      name: "John",
      type: "WEB",
      role: "Protector",
      spells: [],
      coins: 0,
      items: [],
    });
    game.addPlayer({
      id: "2",
      name: "Hello",
      type: "UNITY",
      spells: [],
      coins: 0,
      items: [],
    });
    game.addPlayer({
      id: "3",
      name: "Doe",
      type: "WEB",
      role: "Evilman",
      spells: [],
      coins: 0,
      items: [],
    });

    clientSocket.emit(
      "whoami",
      JSON.stringify({
        id: "3",
      }),
    );

    clientSocket.on("playerInfo", (message) => {
      const player: Player = JSON.parse(message);
      expect(player).toEqual({
        coins: 0,
        id: "3",
        name: "Doe",
        type: "WEB",
        role: "Evilman",
        spells: [],
        items: [],
      });
      done();
    });
  });
});
