import express from 'express';
import { signUp, login, userVerification } from '../controller/authController.js';
const router = express.Router();
router.post("/signUp", signUp);
router.post("/login", login);
router.get("/user/userVerification/:tempToken", userVerification);
export default router;