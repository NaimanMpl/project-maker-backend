import { Bomb } from "../../models/items/bomb.item";
import { PLAYER_MOCK } from "../__fixtures__/player";

describe("Bomb Item", () => {
  it("should substract player health on trigger", () => {
    const player = { ...PLAYER_MOCK };
    const bomb = new Bomb({ x: 0, y: 0, z: 0 });
    bomb.trigger(player);

    expect(player.health).toEqual(99);
  });
});
