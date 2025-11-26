const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    description: String,
    price: { 
        type: Number, 
        required: true 
    },
    quantity: { 
        type: Number, 
        default: 0 
    },

    image: String, // multer filename
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
