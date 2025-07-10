import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { 
  getCarerWeeklySchedule,
  updateCarerWeeklySchedule,
  deleteCarerWeeklyScheduleDay
} from "../controllers/carerSchedule.controller";

const router = Router();

router.use(authMiddleware);

router.get("/:carerID", getCarerWeeklySchedule);
router.post("/:carerID", updateCarerWeeklySchedule);
router.delete("/:carerID/:weekday", deleteCarerWeeklyScheduleDay);

export default router; 