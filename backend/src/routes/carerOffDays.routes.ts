import { Router } from "express";
import { getCarerOffDays, createCarerOffDays, deleteCarerOffDay, updateCarerOffDayById, updateByoffDays } from "../controllers/carerOffDays.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/:carerID", authMiddleware, getCarerOffDays);
router.post("/create", authMiddleware, createCarerOffDays);
router.put("/updateById", authMiddleware, updateCarerOffDayById);
router.delete("/delete", authMiddleware, deleteCarerOffDay);
router.put("/updateCalendar", authMiddleware, updateByoffDays);

export default router; 