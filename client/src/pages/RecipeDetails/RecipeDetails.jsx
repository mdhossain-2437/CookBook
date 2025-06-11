import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { FaHeart, FaClock, FaUtensils } from "react-icons/fa";
import { toast } from "react-toastify";
import { getRecipeById, likeRecipe, getRecipeRatings } from "../../api/recipeApi";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Shared/Loader/Loader";
import RecipeRating from "../../components/Recipe/RecipeRating/RecipeRating";
import RecipeComment from "../../components/Recipe/RecipeComment/RecipeComment";
import RecipeCollection from "../../components/Recipe/RecipeCollection/RecipeCollection";
import RecipeVersion from "../../components/Recipe/RecipeVersion/RecipeVersion";
import IngredientSubstitution from "../../components/Recipe/IngredientSubstitution/IngredientSubstitution";
import NutritionalInfo from "../../components/Recipe/NutritionalInfo/NutritionalInfo";
import RecipeScaling from "../../components/Recipe/RecipeScaling/RecipeScaling";
import CookingTimer from "../../components/Recipe/CookingTimer/CookingTimer";
import SmartGroceryList from "../../components/Recipe/SmartGroceryList/SmartGroceryList";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetchRecipeDetails();
    fetchRecipeRatings();
  }, [id]);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      const data = await getRecipeById(id);
      setRecipe(data);
      
      // Check if current user is the owner of this recipe
      if (user && data.userId === user.uid) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      toast.error("Failed to load recipe details");
      navigate("/all-recipes");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeRatings = async () => {
    try {
      const ratingsData = await getRecipeRatings(id);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Error fetching recipe ratings:", error);
    }
  };

  const handleLike = async () => {
    if (isOwner) {
      toast.info("You cannot like your own recipe");
      return;
    }

    try {
      setLikeLoading(true);
      await likeRecipe(id);
      
      // Update the recipe with incremented like count
      setRecipe(prev => ({
        ...prev,
        likes: prev.likes + 1
      }));
      
      toast.success("Recipe liked successfully!");
    } catch (error) {
      console.error("Error liking recipe:", error);
      toast.error("Failed to like recipe");
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Recipe not found
          </h2>
          <button
            onClick={() => navigate("/all-recipes")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to All Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <Fade triggerOnce>
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            {/* Recipe Image */}
            <div className="relative h-[400px] overflow-hidden">
              <img
                src={recipe.image || "/images/recipe-placeholder.jpg"}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 w-full">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {recipe.title}
                  </h1>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary/80 text-white text-sm rounded-full">
                      {recipe.cuisineType}
                    </span>
                    {recipe.categories &&
                      recipe.categories.map((category) => (
                        <span
                          key={category}
                          className="px-3 py-1 bg-gray-700/80 text-white text-sm rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe Content */}
            <div className="p-6">
              {/* Like Count Banner */}
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-xl font-medium text-gray-800 dark:text-white">
                  <span className="font-bold text-primary">{recipe.likes}</span>{" "}
                  {recipe.likes === 1 ? "person is" : "people are"} interested in
                  this recipe
                </p>
              </div>

              {/* Recipe Info */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FaClock className="text-primary" />
                  <span>{recipe.prepTime} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FaUtensils className="text-primary" />
                  <span>{recipe.cuisineType} Cuisine</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FaHeart
                    className={`${isOwner ? "text-gray-400" : "text-primary"}`}
                  />
                  <span>{recipe.likes} likes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex flex-wrap gap-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading || isOwner}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors ${isOwner
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark"}`}
                >
                  <FaHeart />
                  {likeLoading ? "Liking..." : isOwner ? "Cannot Like Own Recipe" : "Like This Recipe"}
                </button>
                {isOwner && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You cannot like your own recipe
                  </p>
                )}
              </div>

              {/* Recipe Collection Component */}
              <div className="mb-8">
                <RecipeCollection recipeId={id} recipeTitle={recipe.title} />
              </div>

              {/* Recipe Scaling */}
              <div className="mb-8">
                <RecipeScaling ingredients={recipe.ingredients} originalServings={recipe.servings || 4} />
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Ingredients
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  {recipe.ingredients &&
                    recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                </ul>
              </div>

              {/* Ingredient Substitutions */}
              <div className="mb-8">
                <IngredientSubstitution ingredients={recipe.ingredients} />
              </div>

              {/* Nutritional Information */}
              <div className="mb-8">
                <NutritionalInfo ingredients={recipe.ingredients} />
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Instructions</h2>
                <ol className="list-decimal pl-6 space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Cooking Timer */}
              <div className="mb-8">
                <CookingTimer instructions={recipe.instructions} />
              </div>

              {/* Smart Grocery List */}
              <div className="mb-8">
                <SmartGroceryList recipes={[recipe]} />
              </div>

              {/* Recipe Rating */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Ratings & Reviews
                </h2>
                <RecipeRating 
                  recipeId={id} 
                  ratings={ratings} 
                  onRatingAdded={fetchRecipeRatings} 
                  isOwner={isOwner}
                />
              </div>

              {/* Recipe Comments Component */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Comments
                </h2>
                <RecipeComment recipeId={id} />
              </div>

              {/* Recipe Version Component */}
              <div className="mb-8">
                <RecipeVersion recipeId={id} isOwner={isOwner} />
              </div>

              {/* Back Button */}
              <div className="mt-8">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default RecipeDetails;