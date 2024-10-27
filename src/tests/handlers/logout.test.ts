import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { logger } from "../../logger";
import { Player } from "../../models/player";
import { game, io, server } from "../../server";

describe("Logout Handler", () => {
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
    game.reset();
    clientSocket.removeAllListeners();
  });

  afterAll((done) => {
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should remove a player of the lobby", (done) => {
    game.addPlayer({
      id: "1",
      name: "John",
      type: "WEB",
      spells: [],
      coins: 0,
      items: [],
      credits: 0,
      health: 100,
    });

    clientSocket.emit(
      "logout",
      JSON.stringify({
        id: "1",
      }),
    );

    serverSocket.on("logout", (message) => {
      const { id }: { id: string } = JSON.parse(message);

      expect(id).toEqual("1");
      expect(game.players).toEqual({});
    });

    clientSocket.on("logoutplayer", (message) => {
      const {
        players,
        logoutPlayer,
      }: { players: Player[]; logoutPlayer: Player } = JSON.parse(message);
      expect(players).toEqual([]);
      expect(logoutPlayer).toEqual({
        id: "1",
        name: "John",
        type: "WEB",
        spells: [],
        coins: 0,
        items: [],
        credits: 0,
        health: 100,
      });
      done();
    });
  });

  it("should warn if the player id doesn't exist", (done) => {
    const loggerSpy = jest.spyOn(logger, "warn");

    clientSocket.emit(
      "logout",
      JSON.stringify({
        id: "1",
      }),
    );

    serverSocket.on("logout", (message) => {
      const { id }: { id: string } = JSON.parse(message);

      expect(id).toEqual("1");
      expect(game.players).toEqual({});

      expect(loggerSpy).toHaveBeenCalledWith("L'Id du joueur 1 n'existe pas.");

      done();
    });
  });
});
