const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },

    address: {
      country: String,
      city: String,
      street: String,
      postalCode: String,
    },

    role: {
      type: String,
      enum: ['user', 'admin', 'owner'],
      default: 'user',
    },
    token: {
      type: String,
      default: null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
