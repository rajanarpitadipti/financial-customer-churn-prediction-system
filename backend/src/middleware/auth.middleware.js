import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// 🔐 Protect middleware (JWT verification)
export const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if token exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
    // 3. Extract token
    const token = authHeader.split(" ")[1];

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("tokenVersion role approved");
    if (!user || decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // 5. Attach user info to request
    req.user = decoded;

    // 6. Move to next middleware
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};