import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ messsage: "Hello, World!" });
});

app.listen(process.env.PORT, () => {
  console.log("Server listening at port: " + process.env.PORT);
});

export default app;
