const mongoose = require('mongoose');

const UserLoginSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  loginDates: [{ 
    type: Date,
    default: [] 
  }],
  coins: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.models.UserLogin || mongoose.model("UserLogin", UserLoginSchema); 