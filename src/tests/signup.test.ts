import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../server";
import { waitForServer } from "./utils";

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

  beforeEach(() => {
    game.reset();
  });

  afterEach(() => {
    clientSocket.removeAllListeners();
  });

  afterAll((done) => {
    clientSocket.close();
    server.close(done);
    io.close();
  });

  it("should signup a new user if state is LOBBY", async () => {
    clientSocket.emit(
      "signup",
      JSON.stringify({
        name: "John",
        type: "WEB",
      }),
    );

    await waitForServer(serverSocket, "signup");
    expect(game.players).toEqual({
      "123456789": {
        id: "123456789",
        name: "John",
        type: "WEB",
        spells: [],
        speed: 0,
        coins: 0,
        items: [],
        credits: 0,
        specialItems: [],
      },
    });
  });

  it("should not signup a new user if state is not LOBBY and send an error", (done) => {
    game.state.status = "PLAYING";
    clientSocket.emit(
      "signup",
      JSON.stringify({
        name: "John",
        type: "WEB",
      }),
    );

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

  it("should not signup a new user if username already taken and send an error", (done) => {
    game.state.status = "LOBBY";

    game.addPlayer({
      id: "123456789",
      name: "John",
      type: "WEB",
      spells: [],
      speed: 0,
      coins: 0,
      items: [],
      credits: 0,
    });

    clientSocket.emit(
      "signup",
      JSON.stringify({
        name: "John",
        type: "WEB",
      }),
    );

    clientSocket.on("signupfailed", (error) => {
      expect(error).toEqual(
        JSON.stringify({
          type: "USERNAME_ALREADY_TAKEN",
          message: "Username is already taken.",
        }),
      );
      done();
    });
  });
});
