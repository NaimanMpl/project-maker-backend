import { RandomNumberEvent } from "../../events/randomnumber.event";
import { Player } from "../../models/player";
import { game, io } from "../../server";
import { PLAYER_MOCK } from "../__fixtures__/player";

describe("RandomNumberEvent", () => {
  let event: RandomNumberEvent;

  beforeEach(() => {
    event = new RandomNumberEvent({
      min: 0,
      max: 100,
    });
  });

  it("should store submitted responses", () => {
    event.submitResponse({ ...PLAYER_MOCK }, 1);
    expect(event.responses).toEqual([
      {
        player: { ...PLAYER_MOCK },
        response: 1,
      },
    ]);
  });

  it("should reward the evilmans if they are the closest of the random number", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");

    const evilman: Player = { ...PLAYER_MOCK, role: "Evilman" };
    const protector: Player = { ...PLAYER_MOCK, id: "2", role: "Protector" };

    game.addPlayer(evilman);
    game.addPlayer(protector);

    event.randomNumber = 50;
    event.submitResponse(evilman, 49);
    event.submitResponse(protector, 2);

    event.checkWin();

    expect(evilman.credits).toEqual(100);
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "event:winner",
      JSON.stringify({
        type: "RANDOM_NUMBER",
        winnerTeam: "Evilman",
        randomNumber: 50,
      }),
    );
  });

  it("should reward the protectors if they are the closest of the random number", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");

    const evilman: Player = { ...PLAYER_MOCK, role: "Evilman" };
    const protector: Player = { ...PLAYER_MOCK, id: "2", role: "Protector" };

    game.addPlayer(evilman);
    game.addPlayer(protector);

    event.randomNumber = 50;
    event.submitResponse(evilman, 2);
    event.submitResponse(protector, 49);

    event.checkWin();

    expect(protector.credits).toEqual(100);
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "event:winner",
      JSON.stringify({
        type: "RANDOM_NUMBER",
        winnerTeam: "Protector",
        randomNumber: 50,
      }),
    );
  });

  it("should reward both if all teams guess the same number", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");

    const evilman: Player = { ...PLAYER_MOCK, role: "Evilman" };
    const protector: Player = { ...PLAYER_MOCK, id: "2", role: "Protector" };

    game.addPlayer(evilman);
    game.addPlayer(protector);

    event.randomNumber = 50;
    event.submitResponse(evilman, 49);
    event.submitResponse(protector, 49);

    event.checkWin();

    expect(protector.credits).toEqual(50);
    expect(evilman.credits).toEqual(50);
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "event:winner",
      JSON.stringify({
        type: "RANDOM_NUMBER",
        winnerTeam: "Both",
        randomNumber: 50,
      }),
    );
  });

  it("should reward protectors if only them respond", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");

    const evilman: Player = { ...PLAYER_MOCK, role: "Evilman" };
    const protector: Player = { ...PLAYER_MOCK, id: "2", role: "Protector" };

    game.addPlayer(evilman);
    game.addPlayer(protector);

    event.randomNumber = 50;
    event.submitResponse(protector, 49);

    event.checkWin();

    expect(protector.credits).toEqual(100);
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "event:winner",
      JSON.stringify({
        type: "RANDOM_NUMBER",
        winnerTeam: "Protector",
        randomNumber: 50,
      }),
    );
  });

  it("should reward evilmans if only them respond", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");

    const evilman: Player = { ...PLAYER_MOCK, role: "Evilman" };
    const protector: Player = { ...PLAYER_MOCK, id: "2", role: "Protector" };

    game.addPlayer(evilman);
    game.addPlayer(protector);

    event.randomNumber = 50;
    event.submitResponse(evilman, 49);

    event.checkWin();

    expect(evilman.credits).toEqual(100);
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "event:winner",
      JSON.stringify({
        type: "RANDOM_NUMBER",
        winnerTeam: "Evilman",
        randomNumber: 50,
      }),
    );
  });

  it("should not reward if all teams dont submit numbers", () => {
    const ioEmitSpy = jest.spyOn(io, "emit");

    const evilman: Player = { ...PLAYER_MOCK, role: "Evilman" };
    const protector: Player = { ...PLAYER_MOCK, id: "2", role: "Protector" };

    game.addPlayer(evilman);
    game.addPlayer(protector);

    event.randomNumber = 50;
    event.checkWin();

    expect(protector.credits).toEqual(0);
    expect(evilman.credits).toEqual(0);
    expect(ioEmitSpy).toHaveBeenCalledWith(
      "event:winner",
      JSON.stringify({
        type: "RANDOM_NUMBER",
        winnerTeam: "None",
        randomNumber: 50,
      }),
    );
  });
});
