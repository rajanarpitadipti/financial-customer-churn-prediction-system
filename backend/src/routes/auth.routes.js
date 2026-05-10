import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import User from "../models/User.model.js";
import { body } from "express-validator";

const router = express.Router();

// Validation rules to Protect against invalid input and potential Database injection attacks
export const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// PUBLIC ROUTES


// Register new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);


// PROTECTED ROUTES

// Get logged-in user profile
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched successfully",
    user: req.user
  });
});

  
// ADMIN ONLY ROUTES

// Get all users (admin only)
router.get("/users",
  protect,
  isAdmin,
  async (req, res) => {
    try {
      const users = await User.find({}).select("-password");

      res.json({
        success: true,
        count: users.length,
        users
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
export default router;