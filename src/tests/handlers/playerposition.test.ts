import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { UNITY_PLAYER_MOCK } from "../__fixtures__/player";
import { GameError } from "../../models/gameerror";

describe("Player Position Handler", () => {
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

  it("should send an error if the player is unknown", (done) => {
    clientSocket.emit(
      "player:position",
      JSON.stringify({
        id: "2",
        x: 10,
        y: 10,
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

  it("should update the player position", (done) => {
    game.addPlayer({ ...UNITY_PLAYER_MOCK });

    clientSocket.emit(
      "player:position",
      JSON.stringify({
        id: "2",
        x: 10,
        y: 10,
        z: 0,
      }),
    );

    serverSocket.on("player:position", () => {
      expect(game.getPlayer("2").position).toEqual({ x: 10.25, y: 10, z: 0 });
      done();
    });
  });
});
