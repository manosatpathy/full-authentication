import { Router } from "express";
import { authorize, verifyToken } from "../middlewares/authMiddleware";
import { getAllUsers, updateUserRole } from "../controllers/adminController";

const router = Router();

router.get("/users", verifyToken("access"), authorize("admin"), getAllUsers);
router.patch(
  "/users/:userId/role",
  verifyToken("access"),
  authorize("admin"),
  updateUserRole
);

export default router;
