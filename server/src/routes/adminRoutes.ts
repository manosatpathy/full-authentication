import { Router } from "express";
import { authenticateRequest, authorize } from "../middlewares/authMiddleware";
import { getAllUsers, updateUserRole } from "../controllers/adminController";
import { verifyCsrf } from "../middlewares/csrfMiddleware";

const router = Router();

router.get("/users", authenticateRequest, authorize("admin"), getAllUsers);
router.patch(
  "/users/:userId/role",
  authenticateRequest,
  authorize("admin"),
  verifyCsrf,
  updateUserRole
);

export default router;
