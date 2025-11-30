const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true
  },
  name: String, // Snapshot name in case product is deleted
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],

    // Snapshot of the address at the time of order
    shippingAddress: {
        country: String,
        city: String,
        street: String,
        postalCode: String
    },

    // Financials
    subtotal: Number,
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // How much was saved
    totalPrice: { type: Number, required: true },

    paymentMethod: {
        type: String,
        enum: ['COD', 'Card'], // Cash on Delivery or Card
        default: 'COD'
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);