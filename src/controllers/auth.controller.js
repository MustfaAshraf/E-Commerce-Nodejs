const User = require('../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;

    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        status: "fail",
        data: { 
            message: "Email already registered" 
        }
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.token = token;
    await user.save();

    // Store token in HTTP-Only cookie
    res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });


    // Redirect after login
    return res.redirect("/");

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        data: { 
            message: "User not found" 
        }
      });
    }

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return res.status(401).json({
        status: "fail",
        data: { 
            message: "Invalid password" 
        }
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log('token -> ', token);
    user.token = token;
    await user.save();

    // Store token in HTTP-Only cookie
    res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });


    // Redirect after login
    return res.redirect("/");

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
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

