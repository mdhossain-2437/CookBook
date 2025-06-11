import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "../../components/Shared/Loader/Loader";

const UpdateRecipeModal = ({ recipe, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    image: "",
    instructions: "",
    cuisineType: "",
    prepTime: "",
    likes: 0,
    userId: "",
    userEmail: "",
    userName: "",
    createdAt: "",
  });

  // Available options
  const cuisineTypes = ["Italian", "Mexican", "Indian", "Chinese", "Others"];
  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Vegan"];

  // Initialize form with recipe data
  useEffect(() => {
    if (recipe) {
      setFormData({
        _id: recipe._id,
        title: recipe.title || "",
        image: recipe.image || "",
        instructions: recipe.instructions || "",
        cuisineType: recipe.cuisineType || "",
        prepTime: recipe.prepTime || "",
        likes: recipe.likes || 0,
        userId: recipe.userId || "",
        userEmail: recipe.userEmail || "",
        userName: recipe.userName || "",
        createdAt: recipe.createdAt || new Date().toISOString(),
      });
      setIngredients(recipe.ingredients || [""]);
      setSelectedCategories(recipe.categories || []);
    }
  }, [recipe]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle ingredient changes
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  // Add new ingredient field
  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  // Remove ingredient field
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    } else {
      toast.info("Recipe must have at least one ingredient");
    }
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a recipe title");
      return false;
    }

    if (!formData.image.trim()) {
      toast.error("Please provide an image URL");
      return false;
    }

    if (!formData.cuisineType) {
      toast.error("Please select a cuisine type");
      return false;
    }

    if (!formData.prepTime || formData.prepTime <= 0) {
      toast.error("Please enter a valid preparation time");
      return false;
    }

    if (!formData.instructions.trim()) {
      toast.error("Please provide cooking instructions");
      return false;
    }

    if (ingredients.filter((i) => i.trim()).length === 0) {
      toast.error("Please add at least one ingredient");
      return false;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Filter out empty ingredients
    const filteredIngredients = ingredients.filter((i) => i.trim());

    const updatedRecipe = {
      ...formData,
      ingredients: filteredIngredients,
      categories: selectedCategories,
    };

    try {
      setLoading(true);
      await onUpdate(updatedRecipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Failed to update recipe");
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-overlay"
      onClick={handleOutsideClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Update Recipe
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Recipe Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Recipe Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter recipe title"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Recipe Image */}
            <div className="mb-6">
              <label
                htmlFor="image"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Image URL*
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Enter image URL"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              />
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Preview:
                  </p>
                  <img
                    src={formData.image}
                    alt="Recipe preview"
                    className="h-40 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/recipe-placeholder.jpg";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Cuisine Type */}
            <div className="mb-6">
              <label
                htmlFor="cuisineType"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Cuisine Type*
              </label>
              <select
                id="cuisineType"
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundSize: "12px 12px",
                  paddingRight: "2.5rem"
                }}
                required
              >
                <option value="">Select cuisine type</option>
                {cuisineTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Preparation Time */}
            <div className="mb-6">
              <label
                htmlFor="prepTime"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Preparation Time (minutes)*
              </label>
              <input
                type="number"
                id="prepTime"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                placeholder="Enter preparation time"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Categories*
              </label>
              <div className="flex flex-wrap gap-4">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary dark:focus:ring-offset-gray-800"
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-gray-700 dark:text-gray-300"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Ingredients*
              </label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) =>
                      handleIngredientChange(index, e.target.value)
                    }
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-4 py-3 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FaPlus /> Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <label
                htmlFor="instructions"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Instructions*
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Enter cooking instructions"
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size="small" /> Updating...
                  </>
                ) : (
                  "Update Recipe"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateRecipeModal;