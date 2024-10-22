import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameError } from "../../models/gameerror";
import { game, io, server } from "../../server";

describe("Start Handler", () => {
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

  it("should start the game, split players into 2 equals team and start the timer.", (done) => {
    game.addPlayer({
      id: "1",
      name: "John",
      type: "WEB",
      spells: [],
    });
    game.addPlayer({
      id: "2",
      name: "Doe",
      type: "UNITY",
      spells: [],
    });
    game.addPlayer({
      id: "3",
      name: "Hello",
      type: "WEB",
      spells: [],
    });

    clientSocket.emit(
      "start",
      JSON.stringify({
        id: "1",
      }),
    );

    serverSocket.on("start", () => {
      expect(game.unitys).toEqual([
        {
          id: "2",
          name: "Doe",
          type: "UNITY",
          spells: [],
        },
      ]);
      expect(game.evilmans).toHaveLength(1);
      expect(game.protectors).toHaveLength(1);

      expect(game.state.status).toEqual("STARTING");
      expect(game.state.startTimer).toEqual(5);
      done();
    });
  });

  it("should not start the game if the sender is unknown.", (done) => {
    game.addPlayer({
      id: "123456789",
      name: "John",
      type: "WEB",
      spells: [],
    });

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
    process.env.GAMEMODE = "unity";

    game.addPlayer({
      id: "123456789",
      name: "John",
      type: "WEB",
      spells: [],
    });

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
