const Recipe = require('../models/Recipe');

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    const { title, image, ingredients, instructions, cuisineType, preparationTime, categories } = req.body;
    let addedByData = {};

    // Assuming req.user is populated by authentication middleware (e.g., Firebase)
    if (req.user && req.user.uid && req.user.email) {
      addedByData = { userId: req.user.uid, userEmail: req.user.email };
    } else if (req.body.addedBy) {
      // Fallback if req.user is not available but addedBy is in body (for testing/initial setup)
      addedByData = req.body.addedBy;
    } else {
      return res.status(400).json({
        success: false,
        message: 'User information is missing. Cannot create recipe.'
      });
    }

    const newRecipe = new Recipe({
      title,
      image,
      ingredients,
      instructions,
      cuisineType,
      preparationTime,
      categories,
      addedBy: addedByData
    });

    await newRecipe.save();
    res.status(201).json({ success: true, data: newRecipe });
  } catch (error) {
    console.error('Error creating recipe:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error while creating recipe', error: error.message });
  }
};

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().select('-__v');
    res.status(200).json({ success: true, count: recipes.length, data: recipes });
  } catch (error) {
    console.error('Error getting all recipes:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching recipes', error: error.message });
  }
};

// Get single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).select('-__v');
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Recipe not found (invalid ID format)' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching recipe', error: error.message });
  }
};

// Update a recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if user is the owner of the recipe
    // Assuming req.user is populated by authentication middleware
    if (!req.user || recipe.addedBy.userId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this recipe' });
    }

    // Update only the fields that are present in req.body
    const { title, image, ingredients, instructions, cuisineType, preparationTime, categories } = req.body;
    if (title) recipe.title = title;
    if (image) recipe.image = image;
    if (ingredients) recipe.ingredients = ingredients;
    if (instructions) recipe.instructions = instructions;
    if (cuisineType) recipe.cuisineType = cuisineType;
    if (preparationTime) recipe.preparationTime = preparationTime;
    if (categories) recipe.categories = categories;
    // likeCount and addedBy should generally not be updated directly via this endpoint

    const updatedRecipe = await recipe.save();
    
    res.status(200).json({ success: true, data: updatedRecipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Recipe not found (invalid ID format)' });
    }
    res.status(500).json({ success: false, message: 'Server error while updating recipe', error: error.message });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if user is the owner of the recipe
    // Assuming req.user is populated by authentication middleware
    if (!req.user || recipe.addedBy.userId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Recipe not found (invalid ID format)' });
    }
    res.status(500).json({ success: false, message: 'Server error while deleting recipe', error: error.message });
  }
};

// Like a recipe
exports.likeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.uid; // Assuming req.user.uid is populated by verifyToken middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if the user is the owner of the recipe
    if (recipe.addedBy.userId === userId) {
      return res.status(403).json({ success: false, message: 'You cannot like your own recipe.' });
    }

    // Increment likeCount
    // mongoose handles the atomicity of this operation if it's just a simple increment
    // For more complex scenarios, consider findOneAndUpdate with $inc
    recipe.likeCount = (recipe.likeCount || 0) + 1;
    
    await recipe.save();

    res.status(200).json({ success: true, data: recipe });

  } catch (error) {
    console.error('Error liking recipe:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Recipe not found (invalid ID format)' });
    }
    res.status(500).json({ success: false, message: 'Server error while liking recipe', error: error.message });
  }
};

// Get top liked recipes
exports.getTopRecipes = async (req, res) => {
  try {
    const topRecipes = await Recipe.find({})
      .sort({ likeCount: -1 }) // Sort by likeCount in descending order
      .limit(6) // Limit to top 6 recipes
      .select('-__v'); // Exclude the __v field

    res.status(200).json({ success: true, count: topRecipes.length, data: topRecipes });
  } catch (error) {
    console.error('Error getting top recipes:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching top recipes', error: error.message });
  }
};