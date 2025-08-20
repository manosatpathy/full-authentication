import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  verifyMailController,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { registrationSchema } from "../validators/registrationSchema";
import { verifyMailSchema } from "../validators/verifyMailSchema";
import { loginSchema } from "../validators/loginSchema";
import { verifyToken } from "../middlewares/authMiddleware";
import loginLimiter from "../middlewares/loginLimiter";

const router = Router();

router.post(
  "/register",
  validateRequest(registrationSchema),
  registerController
);
router.post(
  "/login",
  validateRequest(loginSchema),
  loginLimiter,
  loginController
);
router.post("/logout", verifyToken("access"), logoutController);
router.post("/refresh-token", refreshTokenController);
router.post(
  "/verify-mail",
  validateRequest(verifyMailSchema),
  verifyMailController
);

export default router;
