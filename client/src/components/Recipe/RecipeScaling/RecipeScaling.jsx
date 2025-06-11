import { useState, useEffect } from 'react';
import { FaUsers, FaMinus, FaPlus, FaRedo } from 'react-icons/fa';

const RecipeScaling = ({ ingredients, originalServings = 4 }) => {
  const [scaledIngredients, setScaledIngredients] = useState([]);
  const [servings, setServings] = useState(originalServings);
  const [originalIngredients, setOriginalIngredients] = useState([]);

  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      setOriginalIngredients([...ingredients]);
      setScaledIngredients([...ingredients]);
    }
  }, [ingredients]);

  // Parse ingredient string to extract quantity and ingredient name
  const parseIngredient = (ingredientStr) => {
    // This regex looks for a number (possibly with fractions) at the start of the string
    const regex = /^([\d\s\/]+)\s+(.+)$/;
    const match = ingredientStr.match(regex);

    if (match) {
      const quantityStr = match[1].trim();
      const rest = match[2].trim();

      // Handle fractions like "1/2"
      if (quantityStr.includes('/')) {
        const fractionParts = quantityStr.split('/');
        if (fractionParts.length === 2) {
          const numerator = parseFloat(fractionParts[0]);
          const denominator = parseFloat(fractionParts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            return {
              quantity: numerator / denominator,
              rest: rest
            };
          }
        }
      }

      // Handle mixed numbers like "1 1/2"
      if (quantityStr.includes(' ')) {
        const mixedParts = quantityStr.split(' ');
        const wholePart = parseFloat(mixedParts[0]);
        if (mixedParts[1].includes('/')) {
          const fractionParts = mixedParts[1].split('/');
          const numerator = parseFloat(fractionParts[0]);
          const denominator = parseFloat(fractionParts[1]);
          if (!isNaN(wholePart) && !isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            return {
              quantity: wholePart + (numerator / denominator),
              rest: rest
            };
          }
        }
      }

      // Handle simple numbers
      const quantity = parseFloat(quantityStr);
      if (!isNaN(quantity)) {
        return {
          quantity: quantity,
          rest: rest
        };
      }
    }

    // If no quantity found, return the original string
    return {
      quantity: null,
      rest: ingredientStr
    };
  };

  // Format a number as a fraction if needed
  const formatQuantity = (num) => {
    if (num === null || isNaN(num)) return '';
    
    // For whole numbers
    if (Number.isInteger(num)) return num.toString();
    
    // For decimals that can be represented as common fractions
    const tolerance = 0.01; // Tolerance for floating point comparison
    
    // Common fractions
    const fractions = [
      { decimal: 0.25, fraction: '1/4' },
      { decimal: 0.33, fraction: '1/3' },
      { decimal: 0.5, fraction: '1/2' },
      { decimal: 0.67, fraction: '2/3' },
      { decimal: 0.75, fraction: '3/4' },
    ];
    
    // Get the decimal part
    const wholePart = Math.floor(num);
    const decimalPart = num - wholePart;
    
    // Check if the decimal part is close to any common fraction
    for (const fraction of fractions) {
      if (Math.abs(decimalPart - fraction.decimal) < tolerance) {
        return wholePart > 0 ? `${wholePart} ${fraction.fraction}` : fraction.fraction;
      }
    }
    
    // If no common fraction matches, round to 2 decimal places
    return num.toFixed(2);
  };

  // Scale an ingredient based on the new serving size
  const scaleIngredient = (ingredient, originalServings, newServings) => {
    const parsed = parseIngredient(ingredient);
    
    if (parsed.quantity === null) {
      return ingredient; // Return unchanged if no quantity found
    }
    
    const scaleFactor = newServings / originalServings;
    const newQuantity = parsed.quantity * scaleFactor;
    const formattedQuantity = formatQuantity(newQuantity);
    
    return `${formattedQuantity} ${parsed.rest}`;
  };

  // Update the scaled ingredients when servings change
  useEffect(() => {
    if (originalIngredients.length > 0) {
      const newScaledIngredients = originalIngredients.map(ingredient => 
        scaleIngredient(ingredient, originalServings, servings)
      );
      setScaledIngredients(newScaledIngredients);
    }
  }, [servings, originalIngredients, originalServings]);

  const incrementServings = () => {
    setServings(prev => prev + 1);
  };

  const decrementServings = () => {
    if (servings > 1) {
      setServings(prev => prev - 1);
    }
  };

  const resetServings = () => {
    setServings(originalServings);
  };

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaUsers className="mr-2 text-primary" />
          Adjust Recipe Servings
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={decrementServings}
            disabled={servings <= 1}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${servings <= 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
          >
            <FaMinus size={12} />
          </button>
          <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
            <input
              type="number"
              min="1"
              max="100"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center bg-transparent border-none focus:outline-none text-gray-800 dark:text-white"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">servings</span>
          </div>
          <button
            onClick={incrementServings}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          >
            <FaPlus size={12} />
          </button>
          {servings !== originalServings && (
            <button
              onClick={resetServings}
              className="ml-2 p-1 text-gray-500 hover:text-primary transition-colors"
              title="Reset to original servings"
            >
              <FaRedo size={14} />
            </button>
          )}
        </div>
      </div>

      {servings !== originalServings && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Recipe adjusted from {originalServings} to {servings} servings
          </p>
        </div>
      )}

      <div className="mt-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adjusted Ingredients:
        </h4>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          {scaledIngredients.map((ingredient, index) => (
            <li key={index} className={servings !== originalServings ? 'font-medium' : ''}>
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      {servings !== originalServings && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Note: Cooking times may need to be adjusted when scaling recipes.
        </p>
      )}
    </div>
  );
};

export default RecipeScaling;