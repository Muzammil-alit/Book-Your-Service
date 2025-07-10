import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { 
    createCarer, 
    getCarers, 
    getCarerLookupList, 
    updateCarer, 
    deleteCarer,
    getCarerServices,
    updateCarerServices,
    getCarerById
} from "../controllers/carer.controller";
import upload from "../middlewares/fileupload.middleware";

const router = Router();

// POST routes
router.post("/", upload.single('profilePic'), authMiddleware, createCarer);
router.post("/updateCarerServices", authMiddleware, updateCarerServices);

// GET routes - specific routes first, then parameter routes
router.get("/getLookupList", authMiddleware, getCarerLookupList);
router.get("/:carerID/services", authMiddleware, getCarerServices);
router.get("/:carerID", authMiddleware, getCarerById);
router.get("/", authMiddleware, getCarers);

// PUT and DELETE routes
router.put("/:carerID", upload.single('profilePic'), authMiddleware, updateCarer);
router.delete("/:carerID", authMiddleware, deleteCarer);

export default router;
