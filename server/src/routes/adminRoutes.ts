import { Router } from "express";
import { authenticateRequest, authorize } from "../middlewares/authMiddleware";
import { getAllUsers, updateUserRole } from "../controllers/adminController";

const router = Router();

router.get("/users", authenticateRequest, authorize("admin"), getAllUsers);
router.patch(
  "/users/:userId/role",
  authenticateRequest,
  authorize("admin"),
  updateUserRole
);

export default router;
