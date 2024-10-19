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
    game.rooms.lobby.players = [];
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should return back the player according to the id provided", (done) => {
    game.rooms.lobby.players.push({
      id: "123456789",
      name: "John",
      type: "WEB",
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
      });
      done();
    });
  });

  it("should return back the player according to the id provided", (done) => {
    game.rooms.lobby.players.push({
      id: "123456789",
      name: "John",
      type: "WEB",
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
    game.rooms.protectors.players = [
      {
        id: "1",
        name: "John",
        type: "WEB",
        role: "Protector",
      },
    ];
    game.rooms.unity.players = [
      {
        id: "2",
        name: "Hello",
        type: "UNITY",
      },
    ];
    game.rooms.evilmans.players = [
      {
        id: "3",
        name: "Doe",
        type: "WEB",
        role: "Evilman",
      },
    ];

    clientSocket.emit(
      "whoami",
      JSON.stringify({
        id: "3",
      }),
    );

    clientSocket.on("playerInfo", (message) => {
      const player: Player = JSON.parse(message);
      expect(player).toEqual({
        id: "3",
        name: "Doe",
        type: "WEB",
        role: "Evilman",
      });
      done();
    });
  });
});