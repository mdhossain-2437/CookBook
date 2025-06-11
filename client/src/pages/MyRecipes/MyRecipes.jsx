import { useState, useEffect } from "react";
import { Fade } from "react-awesome-reveal";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getRecipesByUser, updateRecipe, deleteRecipe } from "../../api/recipeApi";
import useAuth from "../../hooks/useAuth";
import SectionTitle from "../../components/Shared/SectionTitle/SectionTitle";
import Loader from "../../components/Shared/Loader/Loader";
import UpdateRecipeModal from "./UpdateRecipeModal";

const MyRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      if (!user) {
        toast.error("User authentication required");
        setLoading(false);
        return;
      }
      const response = await getRecipesByUser();
      if (response.success && Array.isArray(response.data)) {
        const processedRecipes = response.data.map(recipe => ({
          ...recipe,
          ingredients: typeof recipe.ingredients === 'string' ? recipe.ingredients.split('\n') : recipe.ingredients,
          instructions: typeof recipe.instructions === 'string' ? recipe.instructions.split('\n').join(' ') : (Array.isArray(recipe.instructions) ? recipe.instructions.join(' ') : recipe.instructions), // Display instructions as a single block for card
          preparationTime: recipe.preparationTime || recipe.prepTime, // Ensure correct field
        }));
        setRecipes(processedRecipes);
      } else {
        setRecipes([]);
        toast.error(response.message || "Failed to load your recipes");
      }
    } catch (error) {
      console.error("Error fetching my recipes:", error);
      toast.error("Failed to load your recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  const handleUpdateRecipe = async (updatedRecipe) => {
    try {
      await updateRecipe(updatedRecipe._id, updatedRecipe);
      
      // Update the recipe in the local state
      setRecipes(recipes.map(recipe => 
        recipe._id === updatedRecipe._id ? updatedRecipe : recipe
      ));
      
      toast.success("Recipe updated successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Failed to update recipe");
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        setDeleteLoading(true);
        await deleteRecipe(id);
        
        // Remove the recipe from the local state
        setRecipes(recipes.filter(recipe => recipe._id !== id));
        
        toast.success("Recipe deleted successfully!");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        toast.error("Failed to delete recipe");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <Fade triggerOnce>
          <div className="flex justify-between items-center mb-8">
            <SectionTitle
              title="My Recipes"
              subtitle="Manage your culinary creations"
              centered={false}
            />
            <Link
              to="/add-recipe"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Recipe
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader size="large" />
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <Fade key={recipe._id} direction="up" delay={index * 50} triggerOnce>
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    {/* Recipe Image */}
                    <div className="h-48 overflow-hidden">
                      <img
                        src={recipe.image || "/images/recipe-placeholder.jpg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/recipe-placeholder.jpg";
                        }}
                      />
                    </div>

                    {/* Recipe Content */}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
                        {recipe.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {recipe.cuisineType}
                        </span>
                        {recipe.categories &&
                          recipe.categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        {recipe.categories && recipe.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{recipe.categories.length - 2} more
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          <strong>Prep Time:</strong> {recipe.preparationTime} minutes
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          <strong>Likes:</strong> {recipe.likes}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                          Ingredients:
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                          {recipe.ingredients &&
                            recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                              <li key={idx} className="line-clamp-1">
                                {ingredient}
                              </li>
                            ))}
                          {recipe.ingredients && recipe.ingredients.length > 3 && (
                            <li className="text-gray-500 dark:text-gray-500">
                              +{recipe.ingredients.length - 3} more ingredients
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                          Instructions:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {/* Instructions are now potentially a string joined with spaces, or the original string */}
                          {typeof recipe.instructions === 'string' ? recipe.instructions : (Array.isArray(recipe.instructions) ? recipe.instructions.join(' ') : '')}
                        </p>
                      </div>

                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => handleOpenUpdateModal(recipe)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <FaEdit /> Update
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe._id)}
                          disabled={deleteLoading}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                You haven't added any recipes yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start sharing your culinary creations with the world!
              </p>
              <Link
                to="/add-recipe"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
              >
                <FaPlus /> Add Your First Recipe
              </Link>
            </div>
          )}
        </Fade>
      </div>

      {/* Update Recipe Modal */}
      {isModalOpen && selectedRecipe && (
        <UpdateRecipeModal
          recipe={selectedRecipe}
          onClose={handleCloseModal}
          onUpdate={handleUpdateRecipe}
        />
      )}
    </div>
  );
};

export default MyRecipes;