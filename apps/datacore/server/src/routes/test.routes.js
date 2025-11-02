import express from "express";
import { natsWrapper } from "@tss/nats/wrapper";
// import { MailService } from "../services/mail.service.js";
// import { generateOtp } from "../utils/generateOtp.js";
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ msg: "pong" });
});

router.get("/send", async (req, res) => {
  await natsWrapper.publish("user.created", natsWrapper.encode({ time: Date.now() }));
  res.json({ msg: "pong" });
});

export default router;
