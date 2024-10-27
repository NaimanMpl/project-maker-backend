import { FreezeItem } from "../../models/items/freeze.item";
import { PLAYER_MOCK } from "../__fixtures__/player";

describe("Freeze Item", () => {
  it("should blind a player on trigger", () => {
    const player = { ...PLAYER_MOCK };
    const freezeItem = new FreezeItem();
    freezeItem.trigger(player);

    expect(player.blind).toEqual(true);
  });
});
