import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
    getDeleteRequests,
    updateDeleteRequestStatus,
    getDeleteRequestById,
    getDeleteRequestByClientId
} from '../controllers/deleteRequests.controller';

const router = Router();

router.post('/', authMiddleware, getDeleteRequests);
router.get('/:requestID', authMiddleware, getDeleteRequestById);
router.get('/client/:clientID', authMiddleware, getDeleteRequestByClientId);
router.put('/:requestID/status', authMiddleware, updateDeleteRequestStatus);

export default router;