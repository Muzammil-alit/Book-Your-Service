import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { createDeleteRequest } from '../controllers/deleteRequests.controller';

const router = Router();

router.post('/', authMiddleware, createDeleteRequest);

export default router;