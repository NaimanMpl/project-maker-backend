import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { GameError } from "../../models/gameerror";

describe("Disconnect Handler", () => {
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
    game.reset();
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should error if the dev mode is not enabled", (done) => {
    process.env.DEV_MODE = "disabled";
    clientSocket.emit("restart", undefined);

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "DEV_MODE_NOT_ENABLED",
        message: "The development mode is not enabled.",
      });
      done();
    });
  });

  it("should restart the game if dev mode is enabled", (done) => {
    process.env.DEV_MODE = "enabled";
    clientSocket.emit("restart", undefined);

    serverSocket.on("restart", () => {
      expect(game.state.status).toEqual("LOBBY");
      expect(game.state.startTimer).toEqual(5);
      expect(game.state.items).toEqual([]);
      expect(game.state.loops).toEqual(0);
      expect(game.state.timer).toEqual(300);
      expect(game.players).toEqual({});
      expect(game.sockets).toEqual({});
      done();
    });
  });
});
