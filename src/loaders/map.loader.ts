import { exec } from "child_process";
import { logger } from "../logger";
import path from "path";

const SCRIPT_PATH = path.join(__dirname, "../../assets/MazeGenerator.py");

/* istanbul ignore next */
export const loadMap = (): Promise<number[][]> => {
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
      const data: { map: number[][] } = JSON.parse(stdout);
      resolve(data.map);
    });
  });
};
