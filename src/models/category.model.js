const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: [true, 'Category name is required'], 
        unique: true,
        trim: true,
        minlength: [3, 'Category name must be at least 3 characters']
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);