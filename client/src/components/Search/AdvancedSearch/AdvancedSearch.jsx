import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaClock, FaUtensils, FaLeaf } from 'react-icons/fa';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    ingredients: [],
    cookingTime: {
      min: '',
      max: '',
    },
    difficulty: [],
    dietary: [],
  });
  const [newIngredient, setNewIngredient] = useState('');

  // Difficulty levels
  const difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];

  // Dietary restrictions
  const dietaryRestrictions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
  ];

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (newIngredient.trim() && !filters.ingredients.includes(newIngredient.trim())) {
      setFilters({
        ...filters,
        ingredients: [...filters.ingredients, newIngredient.trim()],
      });
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setFilters({
      ...filters,
      ingredients: filters.ingredients.filter((item) => item !== ingredient),
    });
  };

  const handleDifficultyChange = (level) => {
    if (filters.difficulty.includes(level)) {
      setFilters({
        ...filters,
        difficulty: filters.difficulty.filter((item) => item !== level),
      });
    } else {
      setFilters({
        ...filters,
        difficulty: [...filters.difficulty, level],
      });
    }
  };

  const handleDietaryChange = (restriction) => {
    if (filters.dietary.includes(restriction)) {
      setFilters({
        ...filters,
        dietary: filters.dietary.filter((item) => item !== restriction),
      });
    } else {
      setFilters({
        ...filters,
        dietary: [...filters.dietary, restriction],
      });
    }
  };

  const handleSearch = () => {
    // In a real implementation, this would construct a query string and navigate to search results
    const queryParams = new URLSearchParams();
    
    if (searchQuery) {
      queryParams.append('q', searchQuery);
    }
    
    if (filters.ingredients.length > 0) {
      queryParams.append('ingredients', filters.ingredients.join(','));
    }
    
    if (filters.cookingTime.min) {
      queryParams.append('timeMin', filters.cookingTime.min);
    }
    
    if (filters.cookingTime.max) {
      queryParams.append('timeMax', filters.cookingTime.max);
    }
    
    if (filters.difficulty.length > 0) {
      queryParams.append('difficulty', filters.difficulty.join(','));
    }
    
    if (filters.dietary.length > 0) {
      queryParams.append('dietary', filters.dietary.join(','));
    }
    
    navigate(`/all-recipes?${queryParams.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      ingredients: [],
      cookingTime: {
        min: '',
        max: '',
      },
      difficulty: [],
      dietary: [],
    });
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return (
      filters.ingredients.length > 0 ||
      filters.cookingTime.min ||
      filters.cookingTime.max ||
      filters.difficulty.length > 0 ||
      filters.dietary.length > 0
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 px-4 py-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FaFilter />
            Filters
            {hasActiveFilters() && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                {filters.ingredients.length +
                  (filters.cookingTime.min || filters.cookingTime.max ? 1 : 0) +
                  filters.difficulty.length +
                  filters.dietary.length}
              </span>
            )}
          </button>
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light flex items-center gap-1"
            >
              <FaTimes size={12} /> Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients Filter */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <FaUtensils className="text-primary" /> Ingredients
              </h4>
              <form onSubmit={handleAddIngredient} className="flex mb-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </form>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
                {filters.ingredients.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No ingredients added. Add ingredients to filter recipes.
                  </p>
                )}
              </div>
            </div>

            {/* Cooking Time Filter */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <FaClock className="text-primary" /> Cooking Time (minutes)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.cookingTime.min}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      cookingTime: { ...filters.cookingTime, min: e.target.value },
                    })
                  }
                  placeholder="Min"
                  className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="number"
                  min="0"
                  value={filters.cookingTime.max}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      cookingTime: { ...filters.cookingTime, max: e.target.value },
                    })
                  }
                  placeholder="Max"
                  className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Difficulty Level Filter */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Difficulty Level</h4>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleDifficultyChange(level)}
                    className={`px-3 py-1 rounded-full transition-colors ${filters.difficulty.includes(level)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions Filter */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <FaLeaf className="text-primary" /> Dietary Restrictions
              </h4>
              <div className="flex flex-wrap gap-2">
                {dietaryRestrictions.map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => handleDietaryChange(restriction)}
                    className={`px-3 py-1 rounded-full transition-colors ${filters.dietary.includes(restriction)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {filters.ingredients.map((ingredient, index) => (
              <div
                key={`ing-${index}`}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full"
              >
                Ingredient: {ingredient}
                <button
                  onClick={() => handleRemoveIngredient(ingredient)}
                  className="ml-1 text-primary hover:text-red-500"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}

            {(filters.cookingTime.min || filters.cookingTime.max) && (
              <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full">
                Time: {filters.cookingTime.min || '0'} - {filters.cookingTime.max || 'any'} min
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      cookingTime: { min: '', max: '' },
                    })
                  }
                  className="ml-1 text-primary hover:text-red-500"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            )}

            {filters.difficulty.map((level, index) => (
              <div
                key={`diff-${index}`}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full"
              >
                Difficulty: {level}
                <button
                  onClick={() => handleDifficultyChange(level)}
                  className="ml-1 text-primary hover:text-red-500"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}

            {filters.dietary.map((restriction, index) => (
              <div
                key={`diet-${index}`}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full"
              >
                Diet: {restriction}
                <button
                  onClick={() => handleDietaryChange(restriction)}
                  className="ml-1 text-primary hover:text-red-500"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;