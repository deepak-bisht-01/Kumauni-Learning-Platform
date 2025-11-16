import express from "express";
import {
  getStories,
  getStory,
  updateProgress,
  toggleFavorite,
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

export default router;
