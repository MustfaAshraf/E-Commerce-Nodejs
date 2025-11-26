const User = require('../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { matchedData } = require('express-validator');

// Register
exports.register = async (req, res) => {
  try {
    const data = matchedData(req);

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return res.status(400).render('/register', { 
        message: "Email already registered",
        userInput: req.body // Send back input so they don't have to re-type everything
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      address: data.address
    });

    // 5. GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. SET COOKIE ONLY (Do not save to DB)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // True only on https
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.redirect("/");

  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).render('error', { message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const data = matchedData(req); 

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(401).render('/login', { 
        message: "Invalid email or password",
        userInput: { email: data.email }
      });
    }

    // 3. CHECK PASSWORD
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).render('/login', { 
        message: "Invalid email or password", // Same message for security
        userInput: { email: data.email }
      });
    }

    // 4. GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. SET COOKIE (Removed the DB save part)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 6. SUCCESS REDIRECT
    return res.redirect("/");

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).render('error', { message: "Server error during login" });
  }
};

exports.logout = async (req, res) => {
  try {
    // If user is authenticated, req.user should exist
    // But even if not, we still clear the cookie safely.
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, { token: null });
    }

    // Clear the cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.redirect("/");

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

