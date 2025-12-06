const User = require('../models/users.model');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// GET: Show Profile Page
exports.getProfile = async (req, res) => {
    try {
        // 1. Check if req.user exists (Auth middleware should ensure this, but safety first)
        if (!req.user) {
            return res.redirect('/login');
        }

        // 2. Fetch fresh data from DB
        // Note: Check if your JWT uses 'id' or '_id'. Usually req.user.id from token.
        // We use req.user.id || req.user._id to be safe.
        const userId = req.user.id || req.user._id;
        
        const user = await User.findById(userId);

        // 3. CRITICAL CHECK: Does the user exist in DB?
        if (!user) {
            // The cookie is valid, but the user is gone (deleted from DB).
            // Force Logout.
            res.clearCookie('jwt'); // Or whatever your cookie name is
            return res.redirect('/login');
        }

        res.render('users/profile', {
            pageTitle: 'My Profile',
            user: user,
            message: null,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Could not load profile' });
    }
};

// POST: Update Profile
exports.updateProfile = async (req, res) => {
    try {
        // 1. Safety Check: Is user logged in?
        if (!req.user) {
            return res.redirect('/login');
        }

        // 🔍 FIX: Handle both 'id' (from JWT) and '_id' (from DB object)
        const userId = req.user.id || req.user._id;

        // 2. Verify User exists in DB
        const user = await User.findById(userId);

        if (!user) {
            // User deleted from DB but has a cookie
            res.clearCookie('jwt'); 
            return res.redirect('/login');
        }

        const { name, address } = req.body;

        // 3. Prepare Update Object
        const updates = {
            name: name,
            address: address
        };

        // 4. Handle File Upload
        if (req.file) {
            updates.avatar = req.file.filename;

            // Cleanup: Delete Old Avatar
            if (user.avatar) {
                // Adjust path based on your folder structure (root/uploads or root/public/uploads)
                const oldPath = path.join(__dirname, '../../uploads/userAvatars', user.avatar);
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) console.error("Failed to delete old avatar:", err);
                    });
                }
            }
        }

        // 5. Update Database
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        // 6. Success Response
        res.render('users/profile', {
            pageTitle: 'My Profile',
            user: updatedUser,
            message: 'Profile updated successfully!',
            error: null
        });

    } catch (err) {
        console.error("Update Profile Error:", err);
        
        // 🚨 Error Handling Fix:
        // Ensure we don't crash if req.user is missing in the catch block
        let currentUser = null;
        if (req.user) {
            const id = req.user.id || req.user._id;
            currentUser = await User.findById(id);
        }

        if (currentUser) {
            res.render('users/profile', {
                pageTitle: 'My Profile',
                user: currentUser,
                message: null,
                error: 'Failed to update profile.'
            });
        } else {
            res.redirect('/login');
        }
    }
};

// Get all users (optionally filter by role)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // hide passwords
    return res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get single user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({
      status: 'fail',
      data: { message: 'User not found' }
    });

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;

    // validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'Name, email, and password are required' }
      });
    }

    // check for existing email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: 'fail',
        data: { message: 'Email already exists' }
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({ 
      name, email, password: hashedPassword, role, address 
    });

    return res.status(201).json({
      status: 'success',
      data: { user: { ...user.toObject(), password: undefined } }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // if password is updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    if (!user) return res.status(404).json({
      status: 'fail',
      data: { message: 'User not found' }
    });

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({
      status: 'fail',
      data: { message: 'User not found' }
    });

    return res.status(200).json({
      status: 'success',
      data: { message: 'User deleted' }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
