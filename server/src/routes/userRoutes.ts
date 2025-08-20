import { Router } from "express";
import {
  checkUsername,
  getCurrentUser,
  updateUsername,
} from "../controllers/userController";
import { checkUsernameSchema } from "../validators/usernameSchema";
import { validateRequest } from "../middlewares/validationMiddleware";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", verifyToken("access"), getCurrentUser);
router.get(
  "/check-username",
  verifyToken("access"),
  validateRequest(checkUsernameSchema, "query"),
  checkUsername
);
router.patch(
  "/username",
  verifyToken("access"),
  validateRequest(checkUsernameSchema),
  updateUsername
);

export default router;
