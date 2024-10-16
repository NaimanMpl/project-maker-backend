import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ message: "WebSocket Server Hello World" });
});

const PORT = process.env.PORT ?? 3001;
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server instance to ws
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  // Handle messages from clients
  socket.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
    socket.send(JSON.stringify({ message }));
  });

  // Handle client disconnect
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});
