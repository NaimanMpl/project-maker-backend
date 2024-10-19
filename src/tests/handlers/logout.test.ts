import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
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
    clientSocket.removeAllListeners();
  });

  afterAll((done) => {
    game.rooms.lobby.players = [];
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should remove a player of the lobby", (done) => {
    game.rooms.lobby.players = [
      {
        id: "1",
        name: "John",
        type: "WEB",
      },
    ];

    clientSocket.emit(
      "logout",
      JSON.stringify({
        id: "1",
      }),
    );

    serverSocket.on("logout", (message) => {
      const { id }: { id: string } = JSON.parse(message);

      expect(id).toEqual("1");
      expect(game.rooms.lobby.players).toEqual([]);
    });

    clientSocket.on("logoutplayer", (message) => {
      const {
        players,
        logoutPlayerId,
      }: { players: Player[]; logoutPlayerId: string } = JSON.parse(message);
      expect(players).toEqual([]);
      expect(logoutPlayerId).toEqual("1");
      done();
    });
  });
});
