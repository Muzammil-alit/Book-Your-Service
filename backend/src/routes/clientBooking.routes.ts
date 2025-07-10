import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getClientServices, getAvailableBookingTimeSlots, getClientCarer, insertBooking, getBookingList, updateBooking, deleteBooking, getAvailableBookingDates } from "../controllers/clientBooking.controller";

const router = Router();

router.get("/services", authMiddleware, getClientServices);
router.post("/dates", authMiddleware, getAvailableBookingDates);
router.post("/timeslots", authMiddleware, getAvailableBookingTimeSlots);
router.post("/carer", authMiddleware, getClientCarer);
router.post("/confirm", authMiddleware, insertBooking);
router.get("/mybookings/:clientID", authMiddleware, getBookingList);
router.put("/updatebooking/:clientID", authMiddleware, updateBooking,);
router.delete("/deletebooking/:bookingID", authMiddleware, deleteBooking);

export default router;