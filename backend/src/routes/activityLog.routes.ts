import express from "express";
import {  getActivityLogs } from "../controllers/activityLog.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();


router.get("/", authMiddleware, getActivityLogs);


export default router;
