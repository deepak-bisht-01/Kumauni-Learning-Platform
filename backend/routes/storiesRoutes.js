import express from "express";
import {
  getStories,
  getStory,
  updateProgress,
  toggleFavorite,
  markComplete,
} from "../controllers/storiesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all stories (with optional filters)
router.get("/", requireAuth, getStories);

// Get single story
router.get("/:storyId", requireAuth, getStory);

// Update reading progress
router.post("/:storyId/progress", requireAuth, updateProgress);

// Toggle favorite
router.post("/:storyId/favorite", requireAuth, toggleFavorite);

// Mark story as complete
router.post("/:storyId/complete", requireAuth, markComplete);

export default router;