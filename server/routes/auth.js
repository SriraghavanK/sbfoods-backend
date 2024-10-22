const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../server/models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    console.log("Registration attempt:", { name, email, password, isAdmin }); // Log input data

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists:", email); // Log if user exists
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      isAdmin: isAdmin || false,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();
    console.log("User registered successfully:", user); // Log successful registration

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Registration error:", err.message); // Log the error message
    res.status(500).send("Server error");
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
