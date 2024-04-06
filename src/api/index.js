const express = require("express");

const app = express();

// Load repository into ./repo

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(9182, () => {
  console.log("Server is running on port 9182");
});