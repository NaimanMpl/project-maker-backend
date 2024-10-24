import { exec } from "child_process";
import { logger } from "../logger";
import path from "path";
import { Tile } from "../models/tile";
import { MAP_DATA_MOCK } from "../__mocks__/mapdata";

const SCRIPT_PATH = path.join(__dirname, "../../assets/MazeGenerator.py");

export interface MapData {
  map: number[][];
  start: Tile;
  end: Tile;
}

/* istanbul ignore next */
export const loadMap = (): Promise<MapData> => {
  if (process.env.NODE_ENV === "test") {
    return new Promise((resolve) => resolve(MAP_DATA_MOCK));
  }

  return new Promise((resolve, reject) => {
    exec(`python ${SCRIPT_PATH}`, (error, stdout, stderr) => {
      if (error) {
        reject();
        logger.error(`Erreur lors de l'exécution: ${error.message}`);
        return;
      }
      if (stderr) {
        reject();
        logger.error(`Erreur dans le script : ${stderr}`);
        return;
      }
      logger.info(`Map générée avec succès`);
      const data: MapData = JSON.parse(stdout);
      resolve(data);
    });
  });
};
