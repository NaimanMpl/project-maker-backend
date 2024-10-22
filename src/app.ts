import { server } from "./server";

const PORT = process.env.PORT ?? 3001;

server.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});
