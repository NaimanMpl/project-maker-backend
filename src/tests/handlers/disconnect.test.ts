import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
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
    game.reset();
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should remove player of the lobby if state is LOBBY", (done) => {
    game.state.status = "LOBBY";

    clientSocket.emit(
      "signup",
      JSON.stringify({
        name: "John",
        type: "WEB",
      }),
    );

    clientSocket.on("signupsuccess", () => {
      clientSocket.close();
    });

    serverSocket.on("disconnect", () => {
      expect(game.players).toEqual({});
      done();
    });
  });
});
