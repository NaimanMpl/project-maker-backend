import { logger } from "./logger";
import { server } from "./server";

const PORT = process.env.PORT ?? 3001;

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
