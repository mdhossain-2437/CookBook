import { useState, useEffect } from 'react';
import { FaExchangeAlt, FaInfoCircle, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const IngredientSubstitution = ({ ingredients }) => {
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock database of ingredient substitutions
  const substitutionsDatabase = {
    'flour': [
      { name: 'Almond Flour', ratio: '1:1', notes: 'Gluten-free, adds nutty flavor, best for cookies and quick breads', dietaryInfo: ['Gluten-Free', 'Low-Carb'] },
      { name: 'Coconut Flour', ratio: '1:4', notes: 'Very absorbent, use 1/4 the amount and add extra liquid', dietaryInfo: ['Gluten-Free', 'Paleo'] },
      { name: 'Oat Flour', ratio: '1:1', notes: 'Slightly sweet, make sure it\'s certified gluten-free if needed', dietaryInfo: ['Whole Grain'] },
      { name: 'Rice Flour', ratio: '3:4', notes: 'Use 3/4 cup for each cup of all-purpose flour', dietaryInfo: ['Gluten-Free'] },
    ],
    'butter': [
      { name: 'Coconut Oil', ratio: '1:1', notes: 'Solid at room temperature, good for baking', dietaryInfo: ['Vegan', 'Dairy-Free'] },
      { name: 'Olive Oil', ratio: '3:4', notes: 'Use 3/4 the amount, adds distinct flavor', dietaryInfo: ['Vegan', 'Dairy-Free'] },
      { name: 'Applesauce', ratio: '1:1', notes: 'Good for reducing fat in baked goods', dietaryInfo: ['Low-Fat', 'Vegan'] },
      { name: 'Avocado', ratio: '1:1', notes: 'Good for baking, adds moisture and healthy fats', dietaryInfo: ['Vegan', 'Dairy-Free'] },
    ],
    'eggs': [
      { name: 'Flax Egg', ratio: '1 tbsp ground flax + 3 tbsp water = 1 egg', notes: 'Let sit for 5 minutes before using', dietaryInfo: ['Vegan'] },
      { name: 'Chia Egg', ratio: '1 tbsp chia seeds + 3 tbsp water = 1 egg', notes: 'Let sit for 5-10 minutes before using', dietaryInfo: ['Vegan'] },
      { name: 'Banana', ratio: '1/2 mashed banana = 1 egg', notes: 'Adds sweetness, good for baking', dietaryInfo: ['Vegan'] },
      { name: 'Applesauce', ratio: '1/4 cup = 1 egg', notes: 'Good for moist baked goods', dietaryInfo: ['Vegan'] },
    ],
    'milk': [
      { name: 'Almond Milk', ratio: '1:1', notes: 'Neutral flavor, good all-purpose substitute', dietaryInfo: ['Vegan', 'Dairy-Free'] },
      { name: 'Oat Milk', ratio: '1:1', notes: 'Creamy texture, good for baking', dietaryInfo: ['Vegan', 'Dairy-Free'] },
      { name: 'Coconut Milk', ratio: '1:1', notes: 'Rich and creamy, adds coconut flavor', dietaryInfo: ['Vegan', 'Dairy-Free'] },
      { name: 'Soy Milk', ratio: '1:1', notes: 'Protein-rich, good for baking', dietaryInfo: ['Vegan', 'Dairy-Free'] },
    ],
    'sugar': [
      { name: 'Honey', ratio: '3:4', notes: 'Use 3/4 cup for each cup of sugar, reduce liquid by 1/4 cup', dietaryInfo: ['Natural Sweetener'] },
      { name: 'Maple Syrup', ratio: '3:4', notes: 'Use 3/4 cup for each cup of sugar, reduce liquid by 3 tbsp', dietaryInfo: ['Vegan', 'Natural Sweetener'] },
      { name: 'Coconut Sugar', ratio: '1:1', notes: 'Lower glycemic index than regular sugar', dietaryInfo: ['Natural Sweetener'] },
      { name: 'Stevia', ratio: '1 tsp = 1 cup sugar', notes: 'Very sweet, use sparingly', dietaryInfo: ['Sugar-Free', 'Zero-Calorie'] },
    ],
    'baking powder': [
      { name: 'Baking Soda + Cream of Tartar', ratio: '1/4 tsp baking soda + 1/2 tsp cream of tartar = 1 tsp baking powder', notes: 'Mix immediately before using', dietaryInfo: [] },
      { name: 'Baking Soda + Yogurt', ratio: '1/4 tsp baking soda + 1/2 cup yogurt = 1 tsp baking powder', notes: 'Reduce liquid in recipe by 1/2 cup', dietaryInfo: [] },
      { name: 'Baking Soda + Lemon Juice', ratio: '1/4 tsp baking soda + 1/2 tsp lemon juice = 1 tsp baking powder', notes: 'Adds slight lemon flavor', dietaryInfo: ['Vegan'] },
    ],
    'salt': [
      { name: 'Sea Salt', ratio: '1:1', notes: 'Less processed than table salt', dietaryInfo: [] },
      { name: 'Kosher Salt', ratio: '2:1', notes: 'Use 2 tsp for each 1 tsp of table salt', dietaryInfo: [] },
      { name: 'Herb Blend', ratio: 'To taste', notes: 'Salt-free herb blends can replace salt in many recipes', dietaryInfo: ['Low-Sodium'] },
    ],
    'oil': [
      { name: 'Applesauce', ratio: '1:1', notes: 'Good for baking, reduces fat', dietaryInfo: ['Low-Fat'] },
      { name: 'Greek Yogurt', ratio: '1:1', notes: 'Adds protein and moisture', dietaryInfo: ['Low-Fat'] },
      { name: 'Avocado Oil', ratio: '1:1', notes: 'High smoke point, good for high-heat cooking', dietaryInfo: [] },
      { name: 'Coconut Oil', ratio: '1:1', notes: 'Solid at room temperature, good for baking', dietaryInfo: ['Vegan'] },
    ],
  };

  // Normalize ingredient names for matching
  const normalizeIngredient = (ingredient) => {
    // Extract the main ingredient from measurements and descriptions
    const words = ingredient.toLowerCase().split(' ');
    // Check if any word in the ingredient matches our database keys
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (substitutionsDatabase[cleanWord]) {
        return cleanWord;
      }
    }
    return null;
  };

  // Find substitutions for an ingredient
  const findSubstitutions = (ingredient) => {
    const normalizedIngredient = normalizeIngredient(ingredient);
    if (normalizedIngredient && substitutionsDatabase[normalizedIngredient]) {
      return {
        original: normalizedIngredient,
        substitutions: substitutionsDatabase[normalizedIngredient]
      };
    }
    return null;
  };

  // Get all possible substitutions for the recipe ingredients
  const getAllSubstitutions = () => {
    if (!ingredients || ingredients.length === 0) return [];
    
    return ingredients
      .map(ingredient => ({
        original: ingredient,
        substitutions: findSubstitutions(ingredient)
      }))
      .filter(item => item.substitutions !== null);
  };

  // Filter ingredients based on search term
  const filteredIngredients = () => {
    const allIngredients = ingredients || [];
    if (!searchTerm) return allIngredients;
    
    return allIngredients.filter(ingredient => 
      ingredient.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredient(ingredient);
    const substitutions = findSubstitutions(ingredient);
    if (!substitutions) {
      toast.info(`No substitutions found for ${ingredient}`);
    }
  };

  // Simulate loading substitutions from an API
  useEffect(() => {
    if (selectedIngredient) {
      setLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedIngredient]);

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaExchangeAlt className="mr-2 text-primary" />
          Ingredient Substitutions
        </h3>
        <button
          onClick={() => setShowSubstitutions(!showSubstitutions)}
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {showSubstitutions ? 'Hide' : 'Show'} Substitutions
        </button>
      </div>

      {showSubstitutions && (
        <div>
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ingredients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {filteredIngredients().map((ingredient, index) => {
              const hasSubstitutions = findSubstitutions(ingredient) !== null;
              return (
                <button
                  key={index}
                  onClick={() => handleIngredientClick(ingredient)}
                  className={`p-3 rounded-lg text-left transition-colors ${hasSubstitutions
                    ? 'border border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10'
                    : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  } ${selectedIngredient === ingredient ? 'ring-2 ring-primary' : ''}`}
                  disabled={!hasSubstitutions}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{ingredient}</span>
                    {hasSubstitutions ? (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Substitutes Available
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        No Substitutes
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedIngredient && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                Substitutions for {selectedIngredient}
              </h4>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div>
                  {findSubstitutions(selectedIngredient) ? (
                    <div className="space-y-4">
                      {findSubstitutions(selectedIngredient).substitutions.map((sub, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <h5 className="font-semibold text-gray-800 dark:text-white">{sub.name}</h5>
                            <div className="flex flex-wrap gap-1">
                              {sub.dietaryInfo.map((info, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                >
                                  {info}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            <span className="font-medium">Ratio:</span> {sub.ratio}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-start">
                            <FaInfoCircle className="text-primary mr-1 mt-0.5 flex-shrink-0" />
                            <span>{sub.notes}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      No substitutions found for this ingredient.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientSubstitution;