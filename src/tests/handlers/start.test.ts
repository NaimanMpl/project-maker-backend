import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameError } from "../../models/gameerror";
import { game, io, server } from "../../server";

describe("Start Handler", () => {
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

  afterEach(() => {
    clientSocket.removeAllListeners();
  });

  afterAll((done) => {
    game.rooms.lobby.players = [];
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should start the game, split players into 2 equals team and start the timer.", (done) => {
    game.rooms.lobby.players = [
      {
        id: "1",
        name: "John",
        type: "WEB",
      },
      {
        id: "2",
        name: "Doe",
        type: "UNITY",
      },
      {
        id: "3",
        name: "Hello",
        type: "WEB",
      },
    ];

    clientSocket.emit(
      "start",
      JSON.stringify({
        id: "1",
      }),
    );

    serverSocket.on("start", () => {
      expect(game.rooms.unity.players).toHaveLength(1);
      expect(game.rooms.evilmans.players).toHaveLength(1);
      expect(game.rooms.protectors.players).toHaveLength(1);

      expect(game.state.status).toEqual("STARTING");
      expect(game.state.startTimer).toEqual(5);
      done();
    });
  });

  it("should not start the game if the sender is unknown.", (done) => {
    game.rooms.lobby.players = [
      {
        id: "123456789",
        name: "John",
        type: "WEB",
      },
    ];

    clientSocket.emit(
      "start",
      JSON.stringify({
        id: "unknown_id",
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

  it("should not start the game if there's no unity client connected.", (done) => {
    game.rooms.lobby.players = [
      {
        id: "123456789",
        name: "John",
        type: "WEB",
      },
    ];

    clientSocket.emit(
      "start",
      JSON.stringify({
        id: "123456789",
      }),
    );

    clientSocket.on("error", (message) => {
      const error: GameError = JSON.parse(message);
      expect(error).toEqual({
        type: "UNITY_PLAYER_NOT_FOUND",
        message: "The unity player was not found.",
      });
      done();
    });
  });
});
