import { Router } from "express";
import { loginUser, registerClient, generateResetPasswordCode, validateResetPasswordCode, resetPassword } from "../controllers/auth.controller";

const router = Router();

router.post("/login", loginUser);
router.post ("/generateResetPasswordCode", generateResetPasswordCode);
router.post ("/client/signup", registerClient);
router.post ("/validateResetPasswordCode", validateResetPasswordCode);
router.post ("/resetPassword", resetPassword);

export default router;
