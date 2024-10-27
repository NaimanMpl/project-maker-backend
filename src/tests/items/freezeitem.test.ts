import { FreezeItem } from "../../models/items/freeze.item";
import { game } from "../../server";
import { PLAYER_MOCK } from "../__fixtures__/player";

describe("Freeze Item", () => {
  it("should blind a player on trigger", () => {
    const player = { ...PLAYER_MOCK };
    const freezeItem = new FreezeItem();
    freezeItem.trigger(player);

    expect(player.blind).toEqual(true);
  });

  it("should deactivate blind on all players on reset", () => {
    const freezeItem = new FreezeItem();
    const player = { ...PLAYER_MOCK, blind: true };
    freezeItem.owner = player;
    game.addPlayer(player);

    freezeItem.deactivate();

    expect(player.blind).toEqual(false);
  });
});
