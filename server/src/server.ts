import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ messsage: "ello, World!" });
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
