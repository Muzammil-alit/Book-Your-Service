import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getBookingList, updateBooking, deleteBooking, getBookingbyid } from "../controllers/clientBooking.controller";

const router = Router();

router.get("/:clientID", authMiddleware, getBookingList);
router.post("/allbookings", authMiddleware, getBookingList);
router.put("/:bookingID", authMiddleware, updateBooking);
router.delete("/:bookingID", authMiddleware, deleteBooking);
router.get("/getbooking/:bookingID", authMiddleware, getBookingbyid);


export default router;