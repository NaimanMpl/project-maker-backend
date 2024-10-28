import { RandomNumberEvent } from "../events/randomnumber.event";
import { game } from "../server";

describe("Events", () => {
  beforeEach(() => {
    game.reset();
  });

  it("should update timer on each tick", () => {
    game.currentEvent = new RandomNumberEvent({ min: 0, max: 100 });
    game.state.status = "PLAYING";

    game.tick();

    expect(game.currentEvent.timer).toEqual(9.95);
  });

  it("should change the state to EVENT if eventTimer is less or equal than 0", () => {
    game.state.status = "PLAYING";
    game.state.eventTimer = 0.05;

    expect(game.currentEvent).toEqual(undefined);
    game.tick();

    expect(game.state.status).toEqual("EVENT");
    expect(game.currentEvent).not.toEqual(undefined);
  });

  it("should check win if the timer is less or equal than 0 and reset state", () => {
    const event: RandomNumberEvent = new RandomNumberEvent({
      min: 0,
      max: 100,
    });
    const checkWinSpy = jest.spyOn(event, "checkWin");
    game.currentEvent = event;
    game.state.status = "EVENT";
    game.currentEvent.timer = 0.05;

    game.tick();

    expect(checkWinSpy).toHaveBeenCalled();
    expect(game.state.status).toEqual("PLAYING");
    expect(game.state.eventTimer).toEqual(119.95);
    expect(game.currentEvent).toEqual(undefined);
  });
});
