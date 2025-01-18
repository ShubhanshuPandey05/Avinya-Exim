import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { subscribe } from '../controller/notificationController.js';

const router = express.Router();
router.post("/subscribe",protectRoute,subscribe)
export default router;