import express from "express";
import fs from "fs";
import path from "path";
import https from "https";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

import login from "./routes/login";
import keycheck from "./routes/keycheck";
import sendmail from "./routes/sendmail";

app.use("/login", login);
app.use("/keycheck", keycheck);
app.use("/sendmail", sendmail);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (process.env.NODE_ENV == "production") {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(4200, () => {
      console.log("Server running on port 4200 with HTTPS");
    });
} else {
  app.listen(4200, () => {
    console.log("Server running on port 4200");
  });
}
