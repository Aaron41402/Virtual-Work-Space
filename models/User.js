const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  hasCompletedSetup: { type: Boolean, default: false },
  coins: { type: Number, default: 0 },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);