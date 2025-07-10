import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getDashboardHeader,  getDashboardActiveCarers, getDashboardInactiveCarers, getDashboardMonthlyBookings, getDashboardMonthlyBookingsPerService, getDashboardMonthlyBookingsPerCarer, getDashboardNotifications   } from "../controllers/adminDashboard.controller";

const router = Router();

router.get("/getDashboardHeader", authMiddleware, getDashboardHeader);
router.get("/getDashboardActiveCarers", authMiddleware, getDashboardActiveCarers);
router.get("/getDashboardInactiveCarers", authMiddleware, getDashboardInactiveCarers);
router.post("/getDashboardMonthlyBookings", authMiddleware, getDashboardMonthlyBookings);
router.post("/getDashboardMonthlyBookingsPerService", authMiddleware, getDashboardMonthlyBookingsPerService);
router.post("/getDashboardMonthlyBookingsPerCarer", authMiddleware, getDashboardMonthlyBookingsPerCarer);
router.get("/getDashboardNotifications", authMiddleware, getDashboardNotifications);


export default router;