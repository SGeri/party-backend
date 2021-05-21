import express from "express";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import bcrypt from "bcrypt";
import qr from "qr-image";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "party",
});

connection.connect();

router.post("/", (req, res) => {
  const { id, billing } = req.body.data;
  const { items } = req.body;

  console.log("New Order: " + id + "#");

  isRegisteredEntry(id, async function (registered) {
    if (registered) {
      res.json({ success: true });
    } else {
      try {
        let transporter = await nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: '"Hungarian Rockstar Club" <noreply@huroc.com>',
          to: billing.email,
          subject: "Open Air Party 2021. Jegyek",
          text: "Megérkeztek a jegyeid",
          html: "<b>Megérkeztek a jegyeid</b>",
          attachments: getTickets(id, items, billing.email),
        });

        console.log("Message successfully sent to " + billing.email);
      } catch (e) {
        console.log("Error: " + e);
      }

      res.json({ success: true });
    }
  });
});

function getTickets(orderID, tickets, emailAddress) {
  let ticketFiles = [];

  tickets.forEach((ticket, index) => {
    const ticketKey = generateTicketKey(orderID, ticket, index, emailAddress);

    ticketFiles.push({
      filename: `${ticket}.pdf`,
      content: createPDF(ticket, ticketKey),
    });

    addDatabaseEntry(orderID, ticket, emailAddress, ticketKey);
  });

  return ticketFiles;
}

function createPDF(ticketType, ticketKey) {
  const doc = new PDFDocument();
  doc.image("src/routes/pdf/pdf-empty.png", 0, -30, { fit: [850, 850] });
  doc.font("Helvetica-Bold");

  let qrimage = qr.imageSync(ticketKey);
  doc.image(qrimage, 370, 215, { fit: [190, 190] });

  doc.fontSize(32);
  doc.text(ticketType, 60, 260);
  doc.fontSize(20);
  doc.text(`${returnPriceOfTicket(ticketType)} Ft`, 98, 303);

  doc.end();

  return doc;
}

function generateTicketKey(orderID, ticketType, ticketIndex, emailAddress) {
  return bcrypt.hashSync(
    `${orderID}/${ticketType.toUpperCase()}/${ticketIndex}/${emailAddress.toUpperCase()}`,
    10
  );
}

function returnPriceOfTicket(ticketName) {
  switch (ticketName) {
    case "Normál jegy - Early bird":
      return 1999;
    case "Normál jegy":
      return 2999;
    case "VIP jegy":
      return 4999;
  }
}

function addDatabaseEntry(orderID, ticketType, ticketEmail, ticketKey) {
  return connection.query(
    "INSERT INTO `tickets` (OrderID, TicketType, TicketEmail, TicketKey) VALUES ('" +
      orderID +
      "', '" +
      ticketType +
      "', '" +
      ticketEmail +
      "', '" +
      ticketKey +
      "')",
    function (error) {
      if (error) throw error;
    }
  );
}

function isRegisteredEntry(orderID, callback) {
  return connection.query(
    "SELECT * FROM `tickets` WHERE `OrderID` = '" + orderID + "'",
    function (error, results) {
      if (error) throw error;

      callback(results.length > 0);
    }
  );
}

export default router;
