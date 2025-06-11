# Recipe Book App - Server

This is the backend server for the Recipe Book Application, built with Node.js, Express, and MongoDB.

## Features

- RESTful API for recipe management
- User authentication integration with Firebase
- Recipe filtering by cuisine type and categories
- Like functionality for recipes
- Top recipes listing based on likes

## API Endpoints

### Recipes

- `GET /api/recipes` - Get all recipes with optional filtering
- `GET /api/recipes/top` - Get top recipes by likes
- `GET /api/recipes/cuisine/:cuisineType` - Get recipes by cuisine type
- `GET /api/recipes/user/:userId` - Get recipes by user ID
- `GET /api/recipes/:id` - Get single recipe by ID
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `POST /api/recipes/:id/like` - Like a recipe

### Users

- `POST /api/users` - Create or update user
- `GET /api/users/:uid` - Get user by UID
- `GET /api/users/:uid/liked-recipes` - Get user's liked recipes

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

This server can be deployed to Vercel or any other Node.js hosting platform.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests
- dotenv for environment variables