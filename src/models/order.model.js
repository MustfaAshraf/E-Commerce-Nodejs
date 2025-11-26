const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
},
  quantity: Number,
  priceAtPurchase: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    items: [orderItemSchema],

    totalPrice: Number,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
