import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameState } from "../models/gamestate";
import { game, io, server } from "../server";
import { resetGame } from "./utils";

describe("GameLoop", () => {
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    server.listen(3001, () => {
      clientSocket = ioc("http://localhost:3001");
      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    resetGame(game);
  });

  afterAll((done) => {
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should send gamestate according to the tick rate", (done) => {
    game.state.status = "PLAYING";
    expect(game.state.timer).toBe(0);

    clientSocket.on("gamestate", (msg) => {
      const gamestate: GameState = JSON.parse(msg);

      expect(gamestate.status).toBe("PLAYING");
      expect(gamestate.loops).toBe(0);
      expect(gamestate.timer).toBe(0.05); // (1 / tickRate) = 1 / 20 = 0.05

      done();
    });
  });

  it("should emit a go message for unity players when start timer equals 0", (done) => {
    game.state.status = "LOBBY";

    const unityPlayer = {
      name: "John",
      type: "UNITY",
    };
    clientSocket.emit("signup", JSON.stringify(unityPlayer));

    clientSocket.on("signupsuccess", () => {
      game.rooms.unity.players = [...game.rooms.lobby.players];
      game.state.status = "STARTING";
      game.state.startTimer = 0;
    });

    clientSocket.on("go", (message) => {
      expect(JSON.parse(message)).toHaveProperty("unityMap");
      done();
    });
  });
});
