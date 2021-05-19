import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  if (req.body.key == process.env.LOGIN_KEY) {
    res.json({
      success: true,
      token: process.env.LOGIN_TOKEN,
    });
  } else {
    res.json({ success: false });
  }
});

export default router;
