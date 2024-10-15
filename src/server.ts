import express from "express";
import dotenv from "dotenv";
import WebSocket from 'ws';

// const wss = new WebSocket.Server({ port: 8080 });

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ messsage: "Hello, World!" });
});



app.listen(process.env.PORT, () => {
  console.log("Server listening at port: " + process.env.PORT);
});

export default app;
