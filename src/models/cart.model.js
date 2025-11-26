const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
},
  quantity: { 
    type: Number, 
    default: 1 
},
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true, // one cart per user
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null
    }
    ,
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
