import express from "express";
import { createUser, verifyUser } from "../data/userDatabase.js";

const router = express.Router();

const isValidEmail = (email = "") => /\S+@\S+\.\S+/.test(email);

router.post("/register", async (req, res) => {
  try {
    const { name = "", email = "", password = "" } = req.body;

    if (!name.trim() || !email.trim() || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const result = await createUser({ name, email, password });

    if (result.error) {
      return res.status(409).json({
        error: result.error,
      });
    }

    res.status(201).json({
      message: "Account created",
      user: result.user,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({
      error: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;

    if (!email.trim() || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const result = await verifyUser({ email, password });

    if (result.error) {
      return res.status(401).json({
        error: result.error,
      });
    }

    res.json({
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

export default router;
