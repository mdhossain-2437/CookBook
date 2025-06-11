const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { createError } = require("../utils/error");

// Register a new user
exports.registerUser = async (req, res, next) => {
  try {
    const { uid, name, email, photoURL } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
        data: existingUser,
      });
    }

    // Create new user
    const newUser = new User({
      uid,
      name,
      email,
      photoURL,
    });

    // Save user to database
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: savedUser,
    });
  } catch (error) {
    next(createError(500, "Error registering user"));
  }
};

// Login user
exports.loginUser = async (req, res, next) => {
  try {
    const { uid } = req.body;

    // Find user by uid
    const user = await User.findOne({ uid });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user,
    });
  } catch (error) {
    next(createError(500, "Error logging in user"));
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ uid });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(createError(500, "Error getting current user"));
  }
};

// Create or update user
exports.createOrUpdateUser = async (req, res, next) => {
  try {
    const { uid, name, email, photoURL } = req.body;

    // Find user by uid
    const user = await User.findOne({ uid });

    // If user exists, update user
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.photoURL = photoURL || user.photoURL;

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    }

    // If user doesn't exist, create new user
    const newUser = new User({
      uid,
      name,
      email,
      photoURL,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    next(createError(500, "Error creating or updating user"));
  }
};

// Get user by uid
exports.getUserByUid = async (req, res, next) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(createError(500, "Error getting user"));
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { name, bio, photoURL, specialties } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Update user fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (photoURL) user.photoURL = photoURL;
    if (specialties) user.specialties = specialties;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(createError(500, "Error updating user profile"));
  }
};

// Get liked recipes
exports.getLikedRecipes = async (req, res, next) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const likedRecipes = await Recipe.find({ _id: { $in: user.likedRecipes } });

    res.status(200).json({
      success: true,
      data: likedRecipes,
    });
  } catch (error) {
    next(createError(500, "Error getting liked recipes"));
  }
};

// Like a recipe
exports.likeRecipe = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { recipeId } = req.params;

    // Find user and recipe
    const user = await User.findOne({ uid });
    const recipe = await Recipe.findById(recipeId);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (!recipe) {
      return next(createError(404, "Recipe not found"));
    }

    // Check if recipe is already liked
    if (user.likedRecipes.includes(recipeId)) {
      return res.status(400).json({
        success: false,
        message: "Recipe already liked",
      });
    }

    // Add recipe to liked recipes
    user.likedRecipes.push(recipeId);
    await user.save();

    // Increment recipe like count
    recipe.likeCount += 1;
    await recipe.save();

    res.status(200).json({
      success: true,
      message: "Recipe liked successfully",
    });
  } catch (error) {
    next(createError(500, "Error liking recipe"));
  }
};

// Unlike a recipe
exports.unlikeRecipe = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { recipeId } = req.params;

    // Find user and recipe
    const user = await User.findOne({ uid });
    const recipe = await Recipe.findById(recipeId);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (!recipe) {
      return next(createError(404, "Recipe not found"));
    }

    // Check if recipe is not liked
    if (!user.likedRecipes.includes(recipeId)) {
      return res.status(400).json({
        success: false,
        message: "Recipe not liked",
      });
    }

    // Remove recipe from liked recipes
    user.likedRecipes = user.likedRecipes.filter(
      (id) => id.toString() !== recipeId
    );
    await user.save();

    // Decrement recipe like count
    recipe.likeCount = Math.max(0, recipe.likeCount - 1);
    await recipe.save();

    res.status(200).json({
      success: true,
      message: "Recipe unliked successfully",
    });
  } catch (error) {
    next(createError(500, "Error unliking recipe"));
  }
};

// Follow a user
exports.followUser = async (req, res, next) => {
  try {
    const { uid } = req.user; // Current user
    const { userId } = req.params; // User to follow

    // Check if trying to follow self
    if (uid === userId) {
      return next(createError(400, "Cannot follow yourself"));
    }

    // Find current user and user to follow
    const currentUser = await User.findOne({ uid });
    const userToFollow = await User.findOne({ uid: userId });

    if (!currentUser) {
      return next(createError(404, "Current user not found"));
    }

    if (!userToFollow) {
      return next(createError(404, "User to follow not found"));
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    // Add to following list of current user
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to followers list of user to follow
    userToFollow.followers.push(uid);
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    next(createError(500, "Error following user"));
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res, next) => {
  try {
    const { uid } = req.user; // Current user
    const { userId } = req.params; // User to unfollow

    // Check if trying to unfollow self
    if (uid === userId) {
      return next(createError(400, "Cannot unfollow yourself"));
    }

    // Find current user and user to unfollow
    const currentUser = await User.findOne({ uid });
    const userToUnfollow = await User.findOne({ uid: userId });

    if (!currentUser) {
      return next(createError(404, "Current user not found"));
    }

    if (!userToUnfollow) {
      return next(createError(404, "User to unfollow not found"));
    }

    // Check if not following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Not following this user",
      });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(id => id !== userId);
    await currentUser.save();

    // Remove from followers list of user to unfollow
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== uid);
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    next(createError(500, "Error unfollowing user"));
  }
};

// Get user recipes
exports.getUserRecipes = async (req, res, next) => {
  try {
    const { uid } = req.params;

    const recipes = await Recipe.find({ createdBy: uid });

    res.status(200).json({
      success: true,
      data: recipes,
    });
  } catch (error) {
    next(createError(500, "Error getting user recipes"));
  }
};