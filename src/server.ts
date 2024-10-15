import WebSocket, { Server } from "ws";
import http from "http";

const PORT = 8080;

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

// Create a WebSocket server by passing the HTTP server instance to ws
const wss = new Server({ server });
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  // Handle messages from clients
  ws.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
  });

  // Handle client disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});
