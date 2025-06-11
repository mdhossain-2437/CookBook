import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { motion } from "framer-motion";
import { FaUtensils, FaGlobeAmericas } from "react-icons/fa";
import { getRecipesByCuisine } from "../../api/recipeApi";
import RecipeCard from "../../components/Recipe/RecipeCard";
import SectionTitle from "../../components/Shared/SectionTitle/SectionTitle";
import Loader from "../../components/Shared/Loader/Loader";
import Lottie from "lottie-react";
import foodAnimation from "../../assets/animations/food-animation.json";

const Cuisines = () => {
  const [selectedCuisine, setSelectedCuisine] = useState("Italian");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Available cuisine types from the Recipe model
  const cuisineTypes = ["Italian", "Mexican", "Indian", "Chinese", "Others"];

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await getRecipesByCuisine(selectedCuisine);
        setRecipes(response.data || []);
      } catch (error) {
        console.error(`Error fetching ${selectedCuisine} recipes:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedCuisine]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Fade cascade triggerOnce>
        <SectionTitle 
          title="Explore Cuisines" 
          subtitle="Discover recipes from around the world"
        />

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Cuisine selection sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaGlobeAmericas className="text-primary" />
                <span>Cuisine Types</span>
              </h3>
              
              <div className="space-y-2">
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 ${selectedCuisine === cuisine
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FaUtensils />
                    <span>{cuisine}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <Lottie 
                  animationData={foodAnimation} 
                  loop={true} 
                  className="w-full h-48"
                />
              </div>
            </div>
          </div>

          {/* Recipe grid */}
          <div className="w-full md:w-3/4">
            <motion.div
              key={selectedCuisine}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>{selectedCuisine}</span>
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  ({recipes.length} recipes)
                </span>
              </h2>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    No {selectedCuisine} Recipes Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Be the first to add a {selectedCuisine} recipe to our collection!
                  </p>
                  <Link
                    to="/add-recipe"
                    className="inline-block bg-primary hover:bg-primary-dark text-white font-medium rounded-lg px-6 py-3 transition-colors duration-300"
                  >
                    Add Recipe
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default Cuisines;