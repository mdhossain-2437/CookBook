/**
 * Middleware to validate recipe data before processing
 */
const validateRecipe = (req, res, next) => {
  const { title, image, ingredients, instructions, cuisineType, prepTime, categories, userId, userEmail, userName } = req.body;
  
  // Check required fields
  if (!title || !image || !ingredients || !instructions || !cuisineType || !prepTime || !categories || !userId || !userEmail || !userName) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Validate ingredients array
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Ingredients must be a non-empty array'
    });
  }
  
  // Validate categories array
  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Categories must be a non-empty array'
    });
  }
  
  // Validate cuisine type
  const validCuisineTypes = ['Italian', 'Mexican', 'Indian', 'Chinese', 'Others'];
  if (!validCuisineTypes.includes(cuisineType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid cuisine type. Must be one of: ' + validCuisineTypes.join(', ')
    });
  }
  
  // Validate prep time
  if (isNaN(prepTime) || prepTime < 1) {
    return res.status(400).json({
      success: false,
      message: 'Preparation time must be a number greater than 0'
    });
  }
  
  // If all validations pass, proceed
  next();
};

module.exports = validateRecipe;