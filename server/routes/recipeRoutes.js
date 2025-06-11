const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const validateRecipe = require('../middleware/validateRecipe');
const verifyToken = require('../middleware/verifyToken');

// Get all recipes with optional filtering
router.get('/', recipeController.getAllRecipes);

// Get top recipes by likes
router.get('/top', recipeController.getTopRecipes);

// Get recipes by cuisine type
router.get('/cuisine/:cuisineType', recipeController.getRecipesByCuisine);

// Get recipes by user ID (requires authentication)
router.get('/user', verifyToken, recipeController.getUserRecipes);

// Get single recipe by ID
router.get('/:id', recipeController.getRecipeById);

// Create a new recipe (requires authentication)
router.post('/', verifyToken, validateRecipe, recipeController.createRecipe);

// Update a recipe (requires authentication)
router.put('/:id', verifyToken, validateRecipe, recipeController.updateRecipe);

// Delete a recipe (requires authentication)
router.delete('/:id', verifyToken, recipeController.deleteRecipe);

// Like a recipe (requires authentication)
router.post('/:id/like', verifyToken, recipeController.likeRecipe);

module.exports = router;