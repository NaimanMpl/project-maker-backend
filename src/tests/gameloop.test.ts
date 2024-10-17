import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameState } from "../models/gamestate";
import { game, io, server } from "../server";

describe("GameLoop", () => {
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    server.listen(3001, () => {
      clientSocket = ioc("http://localhost:3001");
      clientSocket.on("connect", done);
    });
  });

  afterAll((done) => {
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should send gamestate according to the tick rate", (done) => {
    expect(game.state.timer).toBe(0);

    clientSocket.on("gamestate", (msg) => {
      const gamestate: GameState = JSON.parse(msg);

      expect(gamestate.status).toBe("LOBBY");
      expect(gamestate.loops).toBe(0);
      expect(gamestate.timer).toBe(0.05); // (1 / tickRate) = 1 / 20 = 0.05

      done();
    });
  });
});
