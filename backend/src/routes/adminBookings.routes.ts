import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { updateBookingStatus } from "../controllers/adminBooking.controller";

const router = Router();

router.post("/update-booking-status/:BookingID", authMiddleware, updateBookingStatus);

export default router;