import { Socket as ServerSocket } from "socket.io";
import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { GameError } from "../../models/gameerror";
import { PLAYER_MOCK } from "../__fixtures__/player";
import { RandomNumberEvent } from "../../events/randomnumber.event";
import { waitForServer } from "../utils";

describe("Event Handler", () => {
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

  it("should error if there is no current event", (done) => {
    game.addPlayer({ ...PLAYER_MOCK });

    clientSocket.emit("event:submit", JSON.stringify({ id: "1", response: 4 }));

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "NO_EVENT",
        message: "There is no event currently active.",
      });
      done();
    });
  });

  it("should error if player is unknown", (done) => {
    clientSocket.emit("event:submit", JSON.stringify({ id: "1", response: 4 }));

    clientSocket.on("error", (msg) => {
      const error: GameError = JSON.parse(msg);
      expect(error).toEqual({
        type: "NOT_A_PLAYER",
        message: "You're not in the players list.",
      });
      done();
    });
  });

  it("should submit player response in the current event", async () => {
    const event = new RandomNumberEvent({ min: 0, max: 100 });
    game.addPlayer({ ...PLAYER_MOCK });
    game.currentEvent = event;

    clientSocket.emit("event:submit", JSON.stringify({ id: "1", response: 4 }));

    await waitForServer(serverSocket, "event:submit");
    expect(event.responses).toEqual([
      {
        player: {
          id: "1",
          name: "John",
          type: "WEB",
          spells: [],
          coins: 0,
          items: [],
          credits: 0,
        },
        response: 4,
      },
    ]);
  });
});
