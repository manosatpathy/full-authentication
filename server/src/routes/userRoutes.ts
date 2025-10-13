import { Router } from "express";
import {
  checkUsername,
  getCurrentUser,
  updateUsername,
} from "../controllers/userController";
import { checkUsernameSchema } from "../validators/usernameSchema";
import { validateRequest } from "../middlewares/validationMiddleware";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { verifyCsrf } from "../middlewares/csrfMiddleware";

const router = Router();

router.get("/me", authenticateRequest, getCurrentUser);
router.get(
  "/check-username",
  authenticateRequest,
  validateRequest(checkUsernameSchema, "query"),
  checkUsername
);
router.patch(
  "/username",
  authenticateRequest,
  validateRequest(checkUsernameSchema),
  verifyCsrf,
  updateUsername
);

export default router;
