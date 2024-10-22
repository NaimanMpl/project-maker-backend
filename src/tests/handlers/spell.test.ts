import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { GameError } from "../../models/gameerror";
import { SlowModeSpell } from "../../models/spells/slowmode.spell";
import { game, io, server } from "../../server";
import { PLAYER_MOCK, UNITY_PLAYER_MOCK } from "../__fixtures__/player";

describe("Spell", () => {
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

  it("should not cast if the status is not PLAYING.", (done) => {
    clientSocket.emit(
      "spell_1_cast",
      JSON.stringify({
        playerId: "1",
        id: 0,
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

  it("should update player speed on cast.", (done) => {
    game.state.status = "PLAYING";
    const player = PLAYER_MOCK;
    game.addPlayer(player);

    const unityPlayer = UNITY_PLAYER_MOCK;
    game.addPlayer(unityPlayer);

    const slowSpell = new SlowModeSpell();
    game.addSpell(player, slowSpell);

    expect(unityPlayer.speed).toEqual(10);

    clientSocket.emit(
      "spell_1_cast",
      JSON.stringify({
        playerId: "1",
        id: 0,
        spell: slowSpell,
      }),
    );

    serverSocket.on("spell_1_cast", () => {
      expect(unityPlayer.speed).toEqual(5);
      done();
    });
  });
});
