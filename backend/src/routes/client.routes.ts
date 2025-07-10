import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getClientByID, updateClientByID, getClientList } from "../controllers/client.controller";

const router = Router();

router.get("/getClientList/:clientID", authMiddleware, getClientList);
router.get("/:clientID", authMiddleware, getClientByID);
router.put("/:clientID", authMiddleware, updateClientByID);

export default router;