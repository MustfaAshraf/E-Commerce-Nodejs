const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: [true, 'Product name is required'], 
        trim: true 
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    price: { 
        type: Number, 
        required: true,
        min: [0, 'Price cannot be negative'] // Prevents $-10
    },

    quantity: { 
        type: Number, 
        default: 0,
        min: [0, 'Quantity cannot be negative']
    },

    image: {
        type: String,
        required: [true, 'Product image is required'] // Usually we want at least one image
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);