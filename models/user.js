const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  }

}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const User = mongoose.model("User", userSchema);

module.exports = User;
