import { Router } from "express";
import { changePassword, createUser, deleteUser, getUserById, getUserList, getUsersLookupList, updateUser } from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createUser);
router.get("/", authMiddleware, getUserList);
router.get("/lookup", authMiddleware, getUsersLookupList);
router.get("/:userID", authMiddleware, getUserById);
router.put("/:userID", authMiddleware, updateUser);
router.post("/change-password", authMiddleware, changePassword);
router.delete("/:userID", authMiddleware, deleteUser);

export default router;
