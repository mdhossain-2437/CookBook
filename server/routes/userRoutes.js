const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/create-or-update', userController.createOrUpdateUser);
router.get('/profile/:uid', userController.getUserByUid);
router.get('/:uid/recipes', userController.getUserRecipes);
router.get('/:uid/liked-recipes', userController.getLikedRecipes);

// Protected routes (authentication required)
router.get('/current', authMiddleware, userController.getCurrentUser);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.post('/like/:recipeId', authMiddleware, userController.likeRecipe);
router.delete('/unlike/:recipeId', authMiddleware, userController.unlikeRecipe);
router.post('/follow/:userId', authMiddleware, userController.followUser);
router.delete('/unfollow/:userId', authMiddleware, userController.unfollowUser);

module.exports = router;