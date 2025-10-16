import { Router } from "express";
import {
  forgetPasswordController,
  resetPasswordController,
  updatePassword,
} from "../controllers/passwordController";
import {
  resetPasswordParamsSchema,
  resetPasswordBodySchema,
} from "../validators/resetPasswordSchema";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { updatePasswordSchema } from "../validators/updatePasswordSchema";
import { resetPasswordEmailSchema } from "./../validators/resetPasswordSchema";

const router = Router();

router.post(
  "/forget",
  validateRequest(resetPasswordEmailSchema),
  forgetPasswordController
);
router.post(
  "/reset/:token",
  validateRequest(resetPasswordParamsSchema, "params"),
  validateRequest(resetPasswordBodySchema),
  resetPasswordController
);
router.patch(
  "/update",
  authenticateRequest,
  validateRequest(updatePasswordSchema),
  updatePassword
);

export default router;
