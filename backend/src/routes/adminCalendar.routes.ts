import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getAdminCalendar, getClientLookupList, updateCompletionStatus, getAdminRoster } from "../controllers/adminCalendar.controller";

const router = Router();

router.get("/getClientList", authMiddleware, getClientLookupList);
router.post("/calendar", authMiddleware, getAdminCalendar);
router.put("/updateCompletionStatus", authMiddleware, updateCompletionStatus);
router.post("/getAdminRoster", authMiddleware, getAdminRoster);

export default router;