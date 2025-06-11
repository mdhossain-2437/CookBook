import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Fade } from "react-awesome-reveal";
import { FaFilter, FaSearch, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { getAllRecipes } from "../../api/recipeApi";
import RecipeCard from "../../components/Recipe/RecipeCard";
import SectionTitle from "../../components/Shared/SectionTitle/SectionTitle";
import Loader from "../../components/Shared/Loader/Loader";
import AdvancedSearch from "../../components/Search/AdvancedSearch/AdvancedSearch";

const AllRecipes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [cuisineType, setCuisineType] = useState(searchParams.get("cuisine") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Filter options
  const cuisineTypes = ["Italian", "Mexican", "Indian", "Chinese", "Others"];
  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Vegan"];

  useEffect(() => {
    fetchRecipes();
  }, [cuisineType, category, sortOrder]);

  useEffect(() => {
    // Parse advanced search params
    const ingredients = searchParams.get('ingredients')?.split(',') || [];
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const difficulty = searchParams.get('difficulty')?.split(',') || [];
    const dietary = searchParams.get('dietary')?.split(',') || [];
    
    // If any advanced search params exist, show the advanced search component
    if (ingredients.length > 0 || timeMin || timeMax || difficulty.length > 0 || dietary.length > 0) {
      setShowAdvancedSearch(true);
    }
  }, [searchParams]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      let data;

      // Build query parameters
      const params = {};
      if (cuisineType) params.cuisineType = cuisineType;
      if (category) params.category = category;
      params.sortOrder = sortOrder;

      // Add advanced search parameters
      const ingredients = searchParams.get('ingredients')?.split(',') || [];
      if (ingredients.length > 0) params.ingredients = ingredients;
      
      const timeMin = searchParams.get('timeMin');
      if (timeMin) params.timeMin = timeMin;
      
      const timeMax = searchParams.get('timeMax');
      if (timeMax) params.timeMax = timeMax;
      
      const difficulty = searchParams.get('difficulty')?.split(',') || [];
      if (difficulty.length > 0) params.difficulty = difficulty;
      
      const dietary = searchParams.get('dietary')?.split(',') || [];
      if (dietary.length > 0) params.dietary = dietary;

      data = await getAllRecipes(params);

      // Filter by search query if present (client-side filtering)
      if (searchQuery) {
        data = data.filter(recipe =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
    fetchRecipes();
  };

  const handleCuisineChange = (e) => {
    const value = e.target.value;
    setCuisineType(value);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("cuisine", value);
    } else {
      params.delete("cuisine");
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const clearFilters = () => {
    setCuisineType("");
    setCategory("");
    setSearchQuery("");
    setSearchParams({});
    fetchRecipes();
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <Fade triggerOnce>
          <SectionTitle
            title="All Recipes"
            subtitle="Explore our collection of delicious recipes"
          />
        </Fade>

        {/* Basic Search and Filters */}
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="w-full py-3 px-4 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary"
                >
                  <FaSearch size={18} />
                </button>
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Cuisine Type Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={cuisineType}
                  onChange={handleCuisineChange}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                    backgroundSize: "12px 12px",
                    paddingRight: "2.5rem"
                  }}
                >
                  <option value="">All Cuisines</option>
                  {cuisineTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                    backgroundSize: "12px 12px",
                    paddingRight: "2.5rem"
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <button
                onClick={toggleSortOrder}
                className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors dark:text-white"
              >
                {sortOrder === "desc" ? (
                  <>
                    <FaSortAmountDown />
                    <span>Newest</span>
                  </>
                ) : (
                  <>
                    <FaSortAmountUp />
                    <span>Oldest</span>
                  </>
                )}
              </button>

              {/* Advanced Search Toggle */}
              <button
                onClick={toggleAdvancedSearch}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <FaFilter />
                <span>{showAdvancedSearch ? "Simple Search" : "Advanced Search"}</span>
              </button>

              {/* Clear Filters */}
              {(cuisineType || category || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  <FaFilter />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Search Component */}
        {showAdvancedSearch && (
          <div className="mb-8">
            <AdvancedSearch />
          </div>
        )}

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <Fade key={recipe._id} direction="up" delay={index * 50} triggerOnce>
                  <RecipeCard recipe={recipe} />
                </Fade>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">
                  No recipes found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRecipes;