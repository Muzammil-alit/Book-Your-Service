import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { 
    createService, 
    updateService,

    deleteService, 
    getServiceLookupList, 
    getServices, 
    updateServiceCarers,
    getServiceCarers,
    getServiceById
} from "../controllers/service.controller";

const router = Router();

router.post("/", authMiddleware, createService);
router.put("/:serviceID", authMiddleware, updateService);
router.get("/", authMiddleware, getServices);
router.get("/getLookupList", authMiddleware, getServiceLookupList);
router.delete("/:serviceID", authMiddleware, deleteService);
router.get("/view/:serviceID", authMiddleware, getServiceById);
router.post("/updateServiceCarers", authMiddleware, updateServiceCarers);
router.get("/:serviceID/carers", authMiddleware, getServiceCarers);

export default router;
