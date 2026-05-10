import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { logEvent } from "../utils/logger.js";

// ==================== REGISTER ====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'bank' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      approved: role === 'bank', // banks auto-approved, admins pending
    });

    res.status(201).json({
      success: true,
      message: user.role === 'admin'
        ? "Admin registration successful. Awaiting approval."
        : "Registration successful. You can now log in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== LOGIN ====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logEvent({
        level: "WARN",
        source: "Auth",
        message: "Login failed: user not found",
        details: email,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.approved) {
      logEvent({
        level: "WARN",
        source: "Auth",
        message: "Login blocked: account pending approval",
        details: email,
        userId: user._id,
      });
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval by an admin.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      logEvent({
        level: "WARN",
        source: "Auth",
        message: "Login failed: invalid password",
        details: email,
        userId: user._id,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        approved: user.approved,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
    logEvent({
      level: "INFO",
      source: "Auth",
      message: "Login successful",
      details: email,
      userId: user._id,
    });
  } catch (error) {
    logEvent({
      level: "ERROR",
      source: "Auth",
      message: "Login request failed",
      details: error.message,
    });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
