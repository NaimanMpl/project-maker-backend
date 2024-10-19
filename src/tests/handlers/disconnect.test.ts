import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { Player } from "../../models/player";

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

  it("should remove player of the lobby if state is not LOBBY", (done) => {
    game.state.status = "PLAYING";
    const player: Player = {
      id: "1",
      name: "John",
      type: "WEB",
    };

    game.addPlayer(player);
    game.setSocket(player, serverSocket);

    clientSocket.close();

    serverSocket.on("disconnect", () => {
      expect(game.players).toEqual({});
      done();
    });
  });
});
