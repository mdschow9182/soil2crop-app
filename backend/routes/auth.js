const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const languages = ["en", "hi", "te", "ta", "kn", "ml"];
const issueToken = (user) => jwt.sign({
  userId: user._id.toString(), farmerId: user.userId, mobile: user.mobile
}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "30d" });
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
  next();
};

router.post("/login", [
  body("mobile").matches(/^\d{10}$/).withMessage("Mobile must be 10 digits"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate
], async (req, res) => {
  try {
    const user = await User.findOne({ mobile: req.body.mobile }).select("+password");
    if (!user || !user.password || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid mobile number or password" });
    }
    user.language = languages.includes(req.body.language) ? req.body.language : user.language;
    await user.save();
    return res.json({
      success: true,
      message: "Login successful",
      token: issueToken(user),
      farmer: { _id: user._id, farmer_id: user.userId, name: user.name || "Farmer", mobile: user.mobile, language: user.language }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name required"),
  body("mobile").matches(/^\d{10}$/).withMessage("Mobile must be 10 digits"),
  body("district").trim().notEmpty().withMessage("District required"),
  body("language").isIn(languages),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  validate
], async (req, res) => {
  try {
    if (await User.exists({ mobile: req.body.mobile })) {
      return res.status(409).json({ success: false, message: "User already exists with this mobile number" });
    }
    const user = await User.create({
      name: req.body.name.trim(), mobile: req.body.mobile,
      district: req.body.district.trim(), language: req.body.language, password: req.body.password
    });
    return res.status(201).json({ success: true, message: "User registered successfully", data: { userId: user.userId, mobile: user.mobile, district: user.district, language: user.language } });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
});

module.exports = router;
