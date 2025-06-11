const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Get all recipes with optional filtering
exports.getAllRecipes = async (req, res) => {
  try {
    const { cuisineType, category, sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = {};
    if (cuisineType) query.cuisineType = cuisineType;
    if (category) query.categories = category;
    
    // Sort options
    const sortOptions = {};
    sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    
    const recipes = await Recipe.find(query)
      .sort(sortOptions)
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get top recipes by likes
exports.getTopRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const recipes = await Recipe.find({})
      .sort({ likes: -1 })
      .limit(limit)
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error('Error getting top recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get recipes by cuisine type
exports.getRecipesByCuisine = async (req, res) => {
  try {
    const { cuisineType } = req.params;
    
    const recipes = await Recipe.find({ cuisineType })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error('Error getting recipes by cuisine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).select('-__v');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get recipes by user ID
exports.getUserRecipes = async (req, res) => {
  try {
    // Get userId from the authenticated user
    const userId = req.user.uid;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const recipes = await Recipe.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    console.error('Error getting user recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    // Ensure the userId from the token matches the one in the request body
    if (req.user && req.user.uid) {
      req.body.userId = req.user.uid;
    }
    
    const newRecipe = await Recipe.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newRecipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Check if user is the owner of the recipe
    if (recipe.userId !== req.body.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }
    
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedRecipe
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Check if user is the owner of the recipe
    if (recipe.userId !== req.query.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }
    
    await Recipe.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Like a recipe
exports.likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Check if user is the owner of the recipe
    if (recipe.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot like your own recipe'
      });
    }
    
    // Update recipe likes count
    recipe.likes += 1;
    await recipe.save();
    
    // Add recipe to user's liked recipes
    await User.findOneAndUpdate(
      { uid: userId },
      { $addToSet: { likedRecipes: recipe._id } }
    );
    
    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Error liking recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};