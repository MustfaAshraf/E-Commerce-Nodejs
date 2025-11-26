const User = require('../models/users.model');
const bcrypt = require('bcrypt');

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
