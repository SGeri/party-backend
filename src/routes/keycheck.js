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
  return connection.query(
    "SELECT * FROM `tickets` WHERE `OrderID` = '" + req.body.key + "'",
    function (error, results) {
      if (error) throw error;

      if (results.length > 0) {
        res.json({ valid: true });
      } else {
        res.json({ valid: false });
      }
    }
  );
});

export default router;
