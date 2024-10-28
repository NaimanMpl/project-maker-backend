import { logger } from "../logger";
import { Event, EventWinner } from "../models/event";
import { Player } from "../models/player";
import { game, io } from "../server";

interface RandomNumberEventOptions {
  min: number;
  max: number;
}

interface Response {
  player: Player;
  response: number;
}

export class RandomNumberEvent extends Event {
  randomNumber: number;
  responses: Response[];

  constructor(options: RandomNumberEventOptions) {
    const { min, max } = options;
    super({
      type: "RANDOM_NUMBER",
      timeLimit: 10,
      description: `Choisis un nombre entre ${min} et ${max}, l'équipe qui se rapproche le plus du nombre aléatoire remporte des crédits`,
    });
    this.randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
    this.responses = [];
  }

  submitResponse(player: Player, response: number): void {
    this.responses.push({ player, response });
  }

  start(): void {}

  checkWin(): void {
    let winner: EventWinner = "None";
    const evilmansResponses = this.responses.filter(
      (response) => response.player.role === "Evilman",
    );
    const protectorsResponses = this.responses.filter(
      (response) => response.player.role === "Protector",
    );
    const getClosestResponse = (responses: Response[]): number => {
      return Math.min(
        ...responses.map((response) =>
          Math.abs(response.response - this.randomNumber),
        ),
      );
    };

    if (evilmansResponses.length > 0 && protectorsResponses.length > 0) {
      const evilmansClosest = getClosestResponse(evilmansResponses);
      const protectorsClosest = getClosestResponse(protectorsResponses);
      if (evilmansClosest < protectorsClosest) {
        winner = "Evilman";
      } else if (protectorsClosest < evilmansClosest) {
        winner = "Protector";
      } else {
        winner = "Both";
      }
    }

    if (evilmansResponses.length === 0 && protectorsResponses.length === 0) {
      winner = "None";
    }

    if (evilmansResponses.length === 0 && protectorsResponses.length > 0) {
      winner = "Protector";
    }

    if (protectorsResponses.length === 0 && evilmansResponses.length > 0) {
      winner = "Evilman";
    }

    switch (winner) {
      case "Both":
        game.webplayers.forEach((player) => {
          player.credits += 10;
        });
        break;
      case "Evilman":
        game.evilmans.forEach((evilman) => {
          evilman.credits += 25;
        });
        break;
      case "Protector":
        game.protectors.forEach((protector) => {
          protector.credits += 25;
        });
        break;
    }

    logger.info(
      `Fin de l'évènement ${this.type}, la bonne réponse était ${this.randomNumber}. Les ${winner} ont gagné.`,
    );

    io.emit(
      "event:winner",
      JSON.stringify({
        type: this.type,
        winnerTeam: winner,
        randomNumber: this.randomNumber,
      }),
    );
  }
}
