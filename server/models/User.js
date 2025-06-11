const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'UID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    photoURL: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    specialties: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    likedRecipes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Recipe',
      default: [],
    },
    followers: {
      type: [String], // Array of user UIDs
      default: [],
    },
    following: {
      type: [String], // Array of user UIDs
      default: [],
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    sessionTimeout: {
      type: Number,
      default: 30, // Default timeout in minutes
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);