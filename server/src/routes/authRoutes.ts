import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshCsrfController,
  refreshTokenController,
  registerController,
  verifyOtpController,
  resendVerificationController,
  verifyUserController,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { registrationSchema } from "../validators/registrationSchema";
import { verifyMailSchema } from "../validators/verifyMailSchema";
import { loginSchema } from "../validators/loginSchema";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { verifyOtpSchema } from "../validators/verifyOtpSchema";
import { verifyCsrf } from "../middlewares/csrfMiddleware";

const router = Router();

router.post(
  "/register",
  validateRequest(registrationSchema),
  registerController
);
router.post(
  "/verify/:token",
  validateRequest(verifyMailSchema, "params"),
  verifyUserController
);
router.post("/login", validateRequest(loginSchema), loginController);
router.post("/verify", validateRequest(verifyOtpSchema), verifyOtpController);
router.post("/logout", authenticateRequest, verifyCsrf, logoutController);
router.post("/refresh-token", refreshTokenController);
router.post("/resend-verification", resendVerificationController);
router.post("/refresh-csrf", authenticateRequest, refreshCsrfController);

export default router;
