import axiosInstance from './axiosInstance';

// Get all recipes with optional pagination
export const getAllRecipes = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/recipes?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return { recipes: [], totalRecipes: 0, totalPages: 0 }; // Return empty data structure
  }
};

// Get top recipes
export const getTopRecipes = async () => {
  try {
    const response = await axiosInstance.get('/recipes/top');
    return response.data;
  } catch (error) {
    console.error('Error fetching top recipes:', error);
    return []; // Return empty array
  }
};

// Get recipes by cuisine
export const getRecipesByCuisine = async (cuisine) => {
  try {
    const response = await axiosInstance.get(`/recipes/cuisine/${cuisine}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${cuisine} recipes:`, error);
    return []; // Return empty array
  }
};

// Get recipe by ID
export const getRecipeById = async (id) => {
  try {
    const response = await axiosInstance.get(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe with ID ${id}:`, error);
    return null; // Return null for single recipe
  }
};

// Get recipes by user
export const getRecipesByUser = async () => {
  try {
    const response = await axiosInstance.get('/recipes/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return { success: false, data: [] }; // Return empty data structure
  }
};

// Add a new recipe
export const addRecipe = async (recipeData) => {
  try {
    const response = await axiosInstance.post('/recipes', recipeData);
    return response.data;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error; // Re-throw for form handling
  }
};

// Update a recipe
export const updateRecipe = async (id, recipeData) => {
  try {
    const response = await axiosInstance.put(`/recipes/${id}`, recipeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating recipe with ID ${id}:`, error);
    throw error; // Re-throw for form handling
  }
};

// Delete a recipe
export const deleteRecipe = async (id) => {
  try {
    const response = await axiosInstance.delete(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting recipe with ID ${id}:`, error);
    throw error; // Re-throw for UI handling
  }
};

// Like a recipe
export const likeRecipe = async (id) => {
  try {
    const response = await axiosInstance.post(`/recipes/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking recipe with ID ${id}:`, error);
    return null; // Return null
  }
};

// Rate a recipe
export const rateRecipe = async (recipeId, ratingData) => {
  try {
    const response = await axiosInstance.post(`/recipes/${recipeId}/ratings`, ratingData);
    return response.data;
  } catch (error) {
    console.error(`Error rating recipe ${recipeId}:`, error);
    throw error;
  }
};

// Get ratings for a recipe
export const getRecipeRatings = async (recipeId) => {
  try {
    const response = await axiosInstance.get(`/recipes/${recipeId}/ratings`);
    return response.data;
  } catch (error) {
    console.error(`Error getting ratings for recipe ${recipeId}:`, error);
    return [];
  }
};

// Update a rating
export const updateRating = async (recipeId, ratingId, ratingData) => {
  try {
    const response = await axiosInstance.put(`/recipes/${recipeId}/ratings/${ratingId}`, ratingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating rating ${ratingId} for recipe ${recipeId}:`, error);
    throw error;
  }
};

// Delete a rating
export const deleteRating = async (recipeId, ratingId) => {
  try {
    const response = await axiosInstance.delete(`/recipes/${recipeId}/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting rating ${ratingId} for recipe ${recipeId}:`, error);
    throw error;
  }
};

// Get all versions of a recipe
export const getRecipeVersions = async (recipeId) => {
  try {
    const response = await axiosInstance.get(`/recipes/${recipeId}/versions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching versions for recipe ${recipeId}:`, error);
    return [];
  }
};

// Get a specific version of a recipe
export const getRecipeVersion = async (recipeId, versionId) => {
  try {
    const response = await axiosInstance.get(`/recipes/${recipeId}/versions/${versionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching version ${versionId} for recipe ${recipeId}:`, error);
    return null;
  }
};

// Create a new version of a recipe
export const createRecipeVersion = async (recipeId, versionData) => {
  try {
    const response = await axiosInstance.post(`/recipes/${recipeId}/versions`, versionData);
    return response.data;
  } catch (error) {
    console.error(`Error creating new version for recipe ${recipeId}:`, error);
    throw error;
  }
};

// Compare two versions of a recipe
export const compareRecipeVersions = async (recipeId, version1Id, version2Id) => {
  try {
    const response = await axiosInstance.get(`/recipes/${recipeId}/versions/compare?v1=${version1Id}&v2=${version2Id}`);
    return response.data;
  } catch (error) {
    console.error(`Error comparing versions for recipe ${recipeId}:`, error);
    return null;
  }
};

// Restore a previous version of a recipe
export const restoreRecipeVersion = async (recipeId, versionId) => {
  try {
    const response = await axiosInstance.post(`/recipes/${recipeId}/versions/${versionId}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Error restoring version ${versionId} for recipe ${recipeId}:`, error);
    throw error;
  }
};