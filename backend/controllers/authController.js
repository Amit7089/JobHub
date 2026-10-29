
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: "user",
  };
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register a new user
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email aur password required hain",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name 2 se 80 characters ke beech hona chahiye",
      });
    }

    if (!validEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address enter karein",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password 8 se 72 characters ka hona chahiye",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Is email se account pehle se registered hai",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Account successfully create ho gaya",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Is email se account pehle se registered hai",
      });
    }

    console.error("Register error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration abhi complete nahi ho paayi",
    });
  }
}

// Login an existing user
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email aur password enter karein",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!validEmail(cleanEmail) || password.length > 72) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai",
      });
    }

    const user = await User.findOne({ email: cleanEmail })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai",
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login abhi complete nahi ho paaya",
    });
  }
}

module.exports = { register, login };
