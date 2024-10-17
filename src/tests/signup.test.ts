import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../server";

describe("SignUp Event", () => {
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

  afterAll((done) => {
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should respond back the messages that are being sent", (done) => {
    clientSocket.emit("message", "Hello, World!");

    clientSocket.on("message", (msg) => {
      expect(msg).toBe(JSON.stringify({ message: "Hello, World!" }));
      done();
    });
  });

  it("should signup a new user if state is LOBBY", (done) => {
    clientSocket.emit(
      "signup",
      JSON.stringify({
        name: "John",
        type: "WEB",
      }),
    );

    serverSocket.on("signup", () => {
      expect(game.rooms.lobby.players).toEqual([
        {
          id: "123456789",
          name: "John",
          type: "WEB",
        },
      ]);
      done();
    });
  });

  it("should not signup a new user if state is not LOBBY and send an error", (done) => {
    clientSocket.emit(
      "signup",
      JSON.stringify({
        name: "John",
        type: "WEB",
      }),
    );

    game.state.status = "PLAYING";

    clientSocket.on("error", (error) => {
      expect(error).toEqual(
        JSON.stringify({
          type: "GAME_ALREADY_STARTED",
          message: "Sorry, the game has already started.",
        }),
      );
      done();
    });
  });
});
