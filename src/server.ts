import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const PORT = process.env.PORT ?? 3000;

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

// Create a WebSocket server by passing the HTTP server instance to ws
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Handle messages from clients
  ws.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
    ws.send(message);
  });

  // Handle client disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});
