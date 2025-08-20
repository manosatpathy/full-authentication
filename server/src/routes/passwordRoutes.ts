import { Router } from "express";
import {
  forgetPasswordController,
  resetPasswordController,
  updatePassword,
} from "../controllers/passwordController";
import { resetPasswordSchema } from "../validators/resetPasswordSchema";
import { verifyToken } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { updatePasswordSchema } from "../validators/updatePasswordSchema";

const router = Router();

router.post("/forget", forgetPasswordController);
router.post(
  "/reset",
  validateRequest(resetPasswordSchema),
  resetPasswordController
);
router.patch(
  "/update",
  verifyToken("access"),
  validateRequest(updatePasswordSchema),
  updatePassword
);

export default router;
