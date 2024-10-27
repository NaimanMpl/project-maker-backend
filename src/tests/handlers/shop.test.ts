import ioc, { Socket as ClientSocket } from "socket.io-client";
import { game, io, server } from "../../server";
import { ShopItem } from "../../models/shop";

describe("Event Handler", () => {
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    server.listen(3001, () => {
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

  it("should return shop items", (done) => {
    clientSocket.emit("shoprequest", undefined);

    clientSocket.on("shop", (msg) => {
      const { items }: { items: ShopItem[] } = JSON.parse(msg);
      expect(items).toEqual([
        {
          name: "Gel",
          type: "FREEZE",
          description: "Gel l'équipe adverse pendant 5 secondes.",
          cost: 100,
        },
      ]);
      done();
    });
  });
});
