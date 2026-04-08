// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    console.log("Auth middleware called for:", req.url);
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token from header:", token ? "Present" : "Missing");

    if (!token) {
      console.log("No token provided, returning 401");
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    console.log("Verifying token with secret:", process.env.JWT_SECRET ? "Present" : "Missing");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);
    req.user = { id: decoded.id };
    console.log("User ID set in request:", req.user.id);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};