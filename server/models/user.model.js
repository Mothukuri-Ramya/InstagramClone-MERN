const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Ensure username is unique
    trim: true,    // Removes unnecessary spaces
    lowercase: true, // Optional: Converts username to lowercase before saving
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure email is unique
    trim: true,    // Removes unnecessary spaces
    lowercase: true, // Optional: Converts email to lowercase before saving
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: { type: String },
  expirationToken: { type: Date },
  photo: {
    type: Buffer,
  },
  photoType: {
    type: String,
  },
  followers: [{ type: ObjectId, ref: "User" }],
  following: [{ type: ObjectId, ref: "User" }],
  bookmarks: [{ type: ObjectId, ref: "Post" }],
});

// Create a model from our schema
module.exports = mongoose.model("User", userSchema);
