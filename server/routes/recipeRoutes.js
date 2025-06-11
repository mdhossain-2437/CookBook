const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const validateRecipe = require('../middleware/validateRecipe');
const verifyToken = require('../middleware/verifyToken');

// POST / - Create a new recipe (requires authentication & validation)
router.post('/', verifyToken, validateRecipe, recipeController.createRecipe);

// GET / - Get all recipes
router.get('/', recipeController.getAllRecipes);

// GET /top - Get top liked recipes
router.get('/top', recipeController.getTopRecipes);

// GET /:id - Get single recipe by ID
router.get('/:id', recipeController.getRecipeById);

// PUT /:id - Update a recipe (requires authentication & validation)
router.put('/:id', verifyToken, validateRecipe, recipeController.updateRecipe);

// DELETE /:id - Delete a recipe (requires authentication)
router.delete('/:id', verifyToken, recipeController.deleteRecipe);

// POST /:id/like - Like a recipe (requires authentication)
router.post('/:id/like', verifyToken, recipeController.likeRecipe);

module.exports = router;