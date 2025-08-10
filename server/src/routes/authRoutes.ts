import { Router, Request, Response } from "express";
import {
  forgetPasswordController,
  getAllUsers,
  getCurrentUser,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPasswordController,
  updatePassword,
  updateUsername,
  verifyMailController,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { registrationSchema } from "../validators/registrationSchema";
import { verifyMailSchema } from "../validators/verifyMailSchema";
import { loginSchema } from "../validators/loginSchema";
import { authorize, verifyToken } from "../middlewares/authMiddleware";
import loginLimiter from "../middlewares/loginLimiter";
import { resetPasswordSchema } from "../validators/resetPasswordSchema";
import { updateFieldsSchema } from "../validators/updateFieldsSchema";
import { checkUsernameSchema } from "../validators/usernameSchema";

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

router.post("/forget-password", forgetPasswordController);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPasswordController
);

router.get("/me", verifyToken("access"), getCurrentUser);
router.get("/users", verifyToken("access"), authorize("admin"), getAllUsers);

router.post(
  "/update-username",
  verifyToken("access"),
  validateRequest(checkUsernameSchema),
  updateUsername
);
router.post(
  "/update-password",
  verifyToken("access"),
  validateRequest(updateFieldsSchema),
  updatePassword
);

export default router;
