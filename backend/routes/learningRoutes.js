import express from "express";
import {
  getLevels,
  getLevelContent,
  getLesson,
  completeLesson,
  getLevelModule,
  completeBlock,
} from "../controllers/learningController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/levels", requireAuth, getLevels);
router.get("/levels/:levelId", requireAuth, getLevelContent);
router.get("/levels/:levelId/lessons/:lessonId", requireAuth, getLesson);
router.post("/lessons/:lessonId/complete", requireAuth, completeLesson);
router.get("/levels/:levelId/module/:type", requireAuth, getLevelModule);
router.post("/blocks/:blockId/complete", requireAuth, completeBlock);

export default router;
