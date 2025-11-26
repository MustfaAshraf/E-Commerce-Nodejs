const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    unique: true, 
    required: true 
},
  discountType: { 
    type: String, 
    enum: ["percentage", "fixed"], 
    required: true 
},
  discountValue: { 
    type: Number, 
    required: true 
},
  expiresAt: { 
    type: Date, 
    required: true 
},
  isActive: { 
    type: Boolean, 
    default: true 
}
});

module.exports = mongoose.model("Coupon", couponSchema);
