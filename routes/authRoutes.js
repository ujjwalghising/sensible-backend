import express from "express";
import { register, verifyEmail, login, resendVerification } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/resend-verification", resendVerification);

export default router;
