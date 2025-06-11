import { useState, useEffect } from 'react';
import { FaHeartbeat, FaWeight, FaFire, FaCarrot, FaDrumstickBite, FaOilCan, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const NutritionalInfo = ({ ingredients }) => {
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [servings, setServings] = useState(4); // Default servings

  // Mock nutrition database for demonstration
  const nutritionDatabase = {
    'flour': { calories: 364, protein: 10.3, carbs: 76.3, fat: 1.0, fiber: 2.7, unit: 'cup', amount: 1 },
    'sugar': { calories: 773, protein: 0, carbs: 200, fat: 0, fiber: 0, unit: 'cup', amount: 1 },
    'butter': { calories: 1628, protein: 1.9, carbs: 0.1, fat: 184, fiber: 0, unit: 'cup', amount: 1 },
    'egg': { calories: 72, protein: 6.3, carbs: 0.4, fat: 5.0, fiber: 0, unit: 'large', amount: 1 },
    'milk': { calories: 103, protein: 8.1, carbs: 12.2, fat: 2.4, fiber: 0, unit: 'cup', amount: 1 },
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, unit: 'breast', amount: 1 },
    'olive oil': { calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0, unit: 'tablespoon', amount: 1 },
    'rice': { calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, unit: 'cup', amount: 1 },
    'pasta': { calories: 221, protein: 8.1, carbs: 43.2, fat: 1.3, fiber: 2.5, unit: 'cup', amount: 1 },
    'tomato': { calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, unit: 'medium', amount: 1 },
    'onion': { calories: 44, protein: 1.2, carbs: 10.3, fat: 0.1, fiber: 1.9, unit: 'medium', amount: 1 },
    'garlic': { calories: 4, protein: 0.2, carbs: 1, fat: 0, fiber: 0.1, unit: 'clove', amount: 1 },
    'carrot': { calories: 25, protein: 0.6, carbs: 6, fat: 0.1, fiber: 1.7, unit: 'medium', amount: 1 },
    'potato': { calories: 163, protein: 4.3, carbs: 37, fat: 0.2, fiber: 3.8, unit: 'medium', amount: 1 },
    'beef': { calories: 213, protein: 22, carbs: 0, fat: 13, fiber: 0, unit: '3 oz', amount: 1 },
    'salmon': { calories: 175, protein: 19, carbs: 0, fat: 10.5, fiber: 0, unit: '3 oz', amount: 1 },
    'cheese': { calories: 113, protein: 7, carbs: 0.9, fat: 9, fiber: 0, unit: 'oz', amount: 1 },
    'avocado': { calories: 234, protein: 2.9, carbs: 12.5, fat: 21, fiber: 9.8, unit: 'medium', amount: 1 },
    'spinach': { calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, unit: 'cup', amount: 1 },
    'broccoli': { calories: 31, protein: 2.6, carbs: 6, fat: 0.3, fiber: 2.4, unit: 'cup', amount: 1 },
    'salt': { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, unit: 'teaspoon', amount: 1 },
    'pepper': { calories: 6, protein: 0.2, carbs: 1.5, fat: 0.1, fiber: 0.6, unit: 'teaspoon', amount: 1 },
  };

  // Parse ingredient string to extract quantity and ingredient name
  const parseIngredient = (ingredientStr) => {
    // This is a simplified parser - a real one would be more sophisticated
    const regex = /([\d.]+)\s*([\w\s]+)\s+of\s+([\w\s]+)|([\d.]+)\s*([\w\s]+)|([\w\s]+)/i;
    const match = ingredientStr.match(regex);

    if (match) {
      if (match[1] && match[2] && match[3]) {
        // Format: "1 cup of flour"
        return {
          quantity: parseFloat(match[1]) || 1,
          unit: match[2].trim(),
          name: match[3].trim().toLowerCase()
        };
      } else if (match[4] && match[5]) {
        // Format: "2 eggs"
        return {
          quantity: parseFloat(match[4]) || 1,
          unit: '',
          name: match[5].trim().toLowerCase()
        };
      } else if (match[6]) {
        // Format: "salt"
        return {
          quantity: 1,
          unit: '',
          name: match[6].trim().toLowerCase()
        };
      }
    }

    // Default fallback
    return {
      quantity: 1,
      unit: '',
      name: ingredientStr.toLowerCase()
    };
  };

  // Find nutrition data for an ingredient
  const findNutritionData = (ingredientName) => {
    // Check for exact match
    if (nutritionDatabase[ingredientName]) {
      return nutritionDatabase[ingredientName];
    }

    // Check for partial matches
    for (const key in nutritionDatabase) {
      if (ingredientName.includes(key) || key.includes(ingredientName)) {
        return nutritionDatabase[key];
      }
    }

    return null;
  };

  // Calculate nutrition data for all ingredients
  const calculateNutrition = () => {
    if (!ingredients || ingredients.length === 0) return null;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let matchedIngredients = 0;

    ingredients.forEach(ingredient => {
      const parsed = parseIngredient(ingredient);
      const nutritionInfo = findNutritionData(parsed.name);

      if (nutritionInfo) {
        // Adjust based on quantity
        const ratio = parsed.quantity / nutritionInfo.amount;
        totalCalories += nutritionInfo.calories * ratio;
        totalProtein += nutritionInfo.protein * ratio;
        totalCarbs += nutritionInfo.carbs * ratio;
        totalFat += nutritionInfo.fat * ratio;
        totalFiber += nutritionInfo.fiber * ratio;
        matchedIngredients++;
      }
    });

    // If we couldn't match any ingredients, return null
    if (matchedIngredients === 0) return null;

    // Calculate per serving
    const perServing = {
      calories: Math.round(totalCalories / servings),
      protein: Math.round(totalProtein / servings),
      carbs: Math.round(totalCarbs / servings),
      fat: Math.round(totalFat / servings),
      fiber: Math.round(totalFiber / servings),
    };

    return {
      total: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        fiber: Math.round(totalFiber),
      },
      perServing,
      matchedIngredients,
      totalIngredients: ingredients.length,
      accuracy: Math.round((matchedIngredients / ingredients.length) * 100)
    };
  };

  // Calculate nutrition when ingredients or servings change
  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const data = calculateNutrition();
        setNutritionData(data);
        setLoading(false);
      }, 500);
    }
  }, [ingredients, servings]);

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaHeartbeat className="mr-2 text-primary" />
          Calculating Nutritional Information...
        </h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!nutritionData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaHeartbeat className="mr-2 text-primary" />
          Nutritional Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Unable to calculate nutritional information for this recipe.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaHeartbeat className="mr-2 text-primary" />
          Nutritional Information
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="servings" className="mr-2 text-sm text-gray-600 dark:text-gray-400">
              Servings:
            </label>
            <input
              id="servings"
              type="number"
              min="1"
              max="20"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-center"
            />
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {nutritionData.accuracy < 70 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start">
            <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Nutrition information is approximate ({nutritionData.accuracy}% of ingredients matched). 
              Values may vary based on specific brands and preparation methods.
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <FaFire className="mx-auto text-xl text-primary mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{nutritionData.perServing.calories}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <FaDrumstickBite className="mx-auto text-xl text-primary mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{nutritionData.perServing.protein}g</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <FaCarrot className="mx-auto text-xl text-primary mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{nutritionData.perServing.carbs}g</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <FaOilCan className="mx-auto text-xl text-primary mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{nutritionData.perServing.fat}g</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <FaWeight className="mx-auto text-xl text-primary mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Fiber</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{nutritionData.perServing.fiber}g</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Values shown are <span className="font-medium">per serving</span> ({servings} servings total)
      </p>

      {showDetails && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-800 dark:text-white mb-3">Detailed Nutrition Information</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Macronutrient Breakdown</h5>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Calculate percentages for the progress bar */}
                {(() => {
                  const total = nutritionData.perServing.protein * 4 + 
                               nutritionData.perServing.carbs * 4 + 
                               nutritionData.perServing.fat * 9;
                  const proteinPct = (nutritionData.perServing.protein * 4 / total) * 100;
                  const carbsPct = (nutritionData.perServing.carbs * 4 / total) * 100;
                  const fatPct = (nutritionData.perServing.fat * 9 / total) * 100;
                  
                  return (
                    <div className="flex h-full">
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${proteinPct}%` }}
                        title={`Protein: ${Math.round(proteinPct)}%`}
                      />
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${carbsPct}%` }}
                        title={`Carbs: ${Math.round(carbsPct)}%`}
                      />
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${fatPct}%` }}
                        title={`Fat: ${Math.round(fatPct)}%`}
                      />
                    </div>
                  );
                })()} 
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Protein</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Carbs</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                  <span>Fat</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Per Serving</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Calories</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.perServing.calories}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Protein</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.perServing.protein}g</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Carbohydrates</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.perServing.carbs}g</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Fat</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.perServing.fat}g</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600 dark:text-gray-400">Fiber</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.perServing.fiber}g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Recipe</h5>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Calories</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.total.calories}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Protein</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.total.protein}g</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Carbohydrates</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.total.carbs}g</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-gray-600 dark:text-gray-400">Fat</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.total.fat}g</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600 dark:text-gray-400">Fiber</td>
                      <td className="py-2 text-right font-medium text-gray-800 dark:text-white">{nutritionData.total.fiber}g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p className="flex items-start">
                <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  Calculations based on {nutritionData.matchedIngredients} out of {nutritionData.totalIngredients} ingredients. 
                  Daily values are based on a 2,000 calorie diet.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalInfo;