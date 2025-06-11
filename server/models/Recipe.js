const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    image: String,
    title: {
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    cuisineType: {
        type: String,
        enum: ['Italian', 'Mexican', 'Indian', 'Chinese', 'Others'],
        required: true
    },
    preparationTime: {
        type: Number,
        required: true
    },
    categories: {
        type: [String],
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan'],
        required: true
    },
    likeCount: {
        type: Number,
        default: 0
    },
    addedBy: {
        userId: { type: String, required: true }, // Firebase UID
        userEmail: { type: String, required: true } // User's email
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recipe', recipeSchema);