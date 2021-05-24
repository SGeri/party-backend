import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect();

router.post("/", (req, res) => {
  const { token } = req.body;

  return connection.query(
    "SELECT * FROM `tickets` WHERE `TicketKey` = '" + req.body.key + "'",
    function (error, results) {
      if (error) throw error;

      if (results.length > 0 && token == process.env.LOGIN_TOKEN) {
        res.json({ valid: true, ticketType: results[0].TicketType });
      } else {
        res.json({ valid: false });
      }
    }
  );
});

export default router;
