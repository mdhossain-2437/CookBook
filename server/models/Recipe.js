const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  ingredients: {
    type: [String],
    required: [true, 'Please provide ingredients'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one ingredient is required'
    }
  },
  instructions: {
    type: String,
    required: [true, 'Please provide cooking instructions']
  },
  cuisineType: {
    type: String,
    required: [true, 'Please provide a cuisine type'],
    enum: ['Italian', 'Mexican', 'Indian', 'Chinese', 'Others']
  },
  prepTime: {
    type: Number,
    required: [true, 'Please provide preparation time'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  categories: {
    type: [String],
    required: [true, 'Please provide at least one category'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  likes: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
RecipeSchema.index({ userId: 1 });
RecipeSchema.index({ likes: -1 });
RecipeSchema.index({ cuisineType: 1 });
RecipeSchema.index({ categories: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);