import axiosInstance from "./axiosInstance";

// Register a new user
export const registerUser = async (userData) => {
  return await axiosInstance.post("/users/register", userData);
};

// Login user
export const loginUser = async (userData) => {
  return await axiosInstance.post("/users/login", userData);
};

// Create or update user
export const createOrUpdateUser = async (userData) => {
  return await axiosInstance.post("/users/create-or-update", userData);
};

// Get current user profile
export const getCurrentUser = async () => {
  return await axiosInstance.get("/users/current");
};

// Get user by UID
export const getUserByUid = async (uid) => {
  return await axiosInstance.get(`/users/profile/${uid}`);
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  return await axiosInstance.put("/users/profile", profileData);
};

// Get user recipes
export const getUserRecipes = async (uid) => {
  return await axiosInstance.get(`/users/${uid}/recipes`);
};

// Get liked recipes
export const getLikedRecipes = async (uid) => {
  return await axiosInstance.get(`/users/${uid}/liked-recipes`);
};

// Like a recipe
export const likeRecipe = async (recipeId) => {
  return await axiosInstance.post(`/users/like/${recipeId}`);
};

// Unlike a recipe
export const unlikeRecipe = async (recipeId) => {
  return await axiosInstance.delete(`/users/unlike/${recipeId}`);
};

// Follow a user
export const followUser = async (userId) => {
  return await axiosInstance.post(`/users/follow/${userId}`);
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  return await axiosInstance.delete(`/users/unfollow/${userId}`);
};