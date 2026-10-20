const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ============================
// REGISTER
// ============================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });

    await user.save();

    res.json({
      success: true,
      message: "Registration Successful",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
});

// ============================
// LOGIN
// ============================

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.json({
        success: false,
        message: "User not found",
      });

    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return res.json({
        success: false,
        message: "Invalid Password",
      });

    }

    const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

    res.json({

      success: true,

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        phone: user.phone,

      },

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

});

module.exports = router;