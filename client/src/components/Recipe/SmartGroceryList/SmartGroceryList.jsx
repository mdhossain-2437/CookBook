import { useState, useEffect } from 'react';
import { FaShoppingBasket, FaPlus, FaTrash, FaCheck, FaRegCheckCircle, FaRegCircle, FaPrint, FaDownload, FaShare } from 'react-icons/fa';

const SmartGroceryList = ({ recipes = [] }) => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [categories, setCategories] = useState({});
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Other');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([
    'Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Pantry', 'Frozen', 'Spices', 'Beverages', 'Other'
  ]);

  // Initialize with recipes if provided
  useEffect(() => {
    if (recipes && recipes.length > 0) {
      setSelectedRecipes(recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        selected: true
      })));
    }
  }, [recipes]);

  // Parse ingredients from selected recipes
  useEffect(() => {
    if (selectedRecipes.length === 0) return;

    const selectedRecipeIds = selectedRecipes
      .filter(recipe => recipe.selected)
      .map(recipe => recipe.id);

    if (selectedRecipeIds.length === 0) {
      setGroceryItems([]);
      setCategories({});
      return;
    }

    const parsedItems = [];
    const categorizedItems = {};

    // Get ingredients from selected recipes
    recipes
      .filter(recipe => selectedRecipeIds.includes(recipe.id))
      .forEach(recipe => {
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return;

        recipe.ingredients.forEach(ingredient => {
          const parsedIngredient = parseIngredient(ingredient);
          if (parsedIngredient) {
            const existingItemIndex = parsedItems.findIndex(
              item => item.name.toLowerCase() === parsedIngredient.name.toLowerCase()
            );

            if (existingItemIndex >= 0) {
              // Combine quantities if possible
              if (parsedIngredient.quantity && parsedItems[existingItemIndex].quantity) {
                if (parsedIngredient.unit === parsedItems[existingItemIndex].unit) {
                  parsedItems[existingItemIndex].quantity += parsedIngredient.quantity;
                } else {
                  // If units don't match, keep as separate items
                  parsedItems.push(parsedIngredient);
                }
              }
            } else {
              parsedItems.push(parsedIngredient);
            }

            // Categorize the item
            const category = categorizeIngredient(parsedIngredient.name);
            if (!categorizedItems[category]) {
              categorizedItems[category] = [];
            }
            
            // Only add if not already in the category
            const itemInCategory = categorizedItems[category].find(
              item => item.name.toLowerCase() === parsedIngredient.name.toLowerCase()
            );
            
            if (!itemInCategory) {
              categorizedItems[category].push(parsedIngredient);
            }
          }
        });
      });

    setGroceryItems(parsedItems);
    setCategories(categorizedItems);
  }, [recipes, selectedRecipes]);

  // Parse ingredient string to extract quantity, unit, and name
  const parseIngredient = (ingredientStr) => {
    if (!ingredientStr || typeof ingredientStr !== 'string') return null;

    // This regex looks for quantity and unit at the start of the string
    const regex = /^(?:([\d\s\/\.]+)\s*([a-zA-Z]+)\s+)?(.+)$/;
    const match = ingredientStr.match(regex);

    if (!match) return { name: ingredientStr.trim(), quantity: null, unit: null };

    const quantityStr = match[1];
    const unit = match[2];
    const name = match[3].trim();

    let quantity = null;
    if (quantityStr) {
      // Handle fractions like "1/2"
      if (quantityStr.includes('/')) {
        const fractionParts = quantityStr.split('/');
        if (fractionParts.length === 2) {
          const numerator = parseFloat(fractionParts[0]);
          const denominator = parseFloat(fractionParts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            quantity = numerator / denominator;
          }
        }
      } else {
        quantity = parseFloat(quantityStr);
        if (isNaN(quantity)) quantity = null;
      }
    }

    return {
      name: name,
      quantity: quantity,
      unit: unit || null
    };
  };

  // Categorize ingredient based on name
  const categorizeIngredient = (name) => {
    name = name.toLowerCase();
    
    const categoryMap = {
      'Produce': ['apple', 'banana', 'orange', 'lemon', 'lime', 'tomato', 'potato', 'onion', 'garlic', 'lettuce', 'spinach', 'kale', 'carrot', 'celery', 'pepper', 'cucumber', 'zucchini', 'broccoli', 'cauliflower', 'mushroom', 'avocado', 'herb', 'cilantro', 'parsley', 'basil', 'mint', 'thyme', 'rosemary', 'sage', 'fruit', 'vegetable'],
      'Dairy': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'sour cream', 'ice cream', 'egg', 'margarine'],
      'Meat': ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'ham', 'steak', 'ground beef', 'ground turkey', 'meatball', 'meatloaf'],
      'Seafood': ['fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'tilapia', 'cod', 'halibut'],
      'Bakery': ['bread', 'roll', 'bun', 'bagel', 'muffin', 'croissant', 'cake', 'cookie', 'pie', 'pastry', 'dough', 'flour', 'tortilla', 'pita'],
      'Pantry': ['rice', 'pasta', 'noodle', 'cereal', 'oat', 'bean', 'lentil', 'chickpea', 'pea', 'corn', 'oil', 'vinegar', 'sauce', 'salsa', 'ketchup', 'mustard', 'mayonnaise', 'soy sauce', 'honey', 'syrup', 'jam', 'jelly', 'peanut butter', 'almond butter', 'nut', 'seed', 'dried', 'canned', 'tomato sauce', 'broth', 'stock', 'soup', 'sugar', 'salt', 'pepper'],
      'Frozen': ['frozen', 'ice', 'pizza', 'fries', 'vegetable blend', 'berries'],
      'Spices': ['spice', 'herb', 'seasoning', 'salt', 'pepper', 'cinnamon', 'nutmeg', 'paprika', 'cumin', 'oregano', 'basil', 'thyme', 'rosemary', 'sage', 'bay leaf', 'chili powder', 'curry powder', 'ginger', 'turmeric', 'cardamom', 'clove', 'vanilla'],
      'Beverages': ['water', 'coffee', 'tea', 'juice', 'soda', 'milk', 'beer', 'wine', 'liquor', 'cocktail', 'smoothie', 'shake', 'drink']
    };
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  };

  // Toggle recipe selection
  const toggleRecipeSelection = (id) => {
    setSelectedRecipes(prev => 
      prev.map(recipe => 
        recipe.id === id ? { ...recipe, selected: !recipe.selected } : recipe
      )
    );
  };

  // Toggle item checked status
  const toggleItemChecked = (itemName) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Add custom item to grocery list
  const addCustomItem = () => {
    if (!newItem.trim()) return;
    
    const newItemObj = {
      name: newItem.trim(),
      quantity: null,
      unit: null,
      isCustom: true
    };
    
    setGroceryItems(prev => [...prev, newItemObj]);
    
    // Add to appropriate category
    setCategories(prev => {
      const updatedCategories = { ...prev };
      if (!updatedCategories[newCategory]) {
        updatedCategories[newCategory] = [];
      }
      updatedCategories[newCategory].push(newItemObj);
      return updatedCategories;
    });
    
    setNewItem('');
    setShowAddItem(false);
  };

  // Remove item from grocery list
  const removeItem = (itemName, category) => {
    setGroceryItems(prev => prev.filter(item => item.name !== itemName));
    
    setCategories(prev => {
      const updatedCategories = { ...prev };
      if (updatedCategories[category]) {
        updatedCategories[category] = updatedCategories[category].filter(item => item.name !== itemName);
        if (updatedCategories[category].length === 0) {
          delete updatedCategories[category];
        }
      }
      return updatedCategories;
    });
    
    // Also remove from checked items if present
    if (checkedItems[itemName]) {
      const updatedCheckedItems = { ...checkedItems };
      delete updatedCheckedItems[itemName];
      setCheckedItems(updatedCheckedItems);
    }
  };

  // Print grocery list
  const printGroceryList = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Grocery List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .category { margin-bottom: 20px; }
            h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            ul { list-style-type: none; padding-left: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; }
            .checked { text-decoration: line-through; color: #999; }
            .recipe-list { margin-top: 30px; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <h1>Grocery List</h1>
    `);
    
    // Add recipes used
    const selectedRecipeNames = selectedRecipes
      .filter(recipe => recipe.selected)
      .map(recipe => recipe.title);
    
    if (selectedRecipeNames.length > 0) {
      printWindow.document.write(`
        <div class="recipe-list">
          <p><strong>Recipes:</strong> ${selectedRecipeNames.join(', ')}</p>
        </div>
      `);
    }
    
    // Add categories and items
    Object.entries(categories).forEach(([category, items]) => {
      printWindow.document.write(`
        <div class="category">
          <h2>${category}</h2>
          <ul>
      `);
      
      items.forEach(item => {
        const isChecked = checkedItems[item.name];
        const itemText = item.quantity && item.unit 
          ? `${item.quantity} ${item.unit} ${item.name}` 
          : item.name;
        
        printWindow.document.write(`
          <li class="${isChecked ? 'checked' : ''}">
            ${isChecked ? '☑' : '☐'} ${itemText}
          </li>
        `);
      });
      
      printWindow.document.write(`
          </ul>
        </div>
      `);
    });
    
    printWindow.document.write(`
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Download grocery list as text file
  const downloadGroceryList = () => {
    let content = "GROCERY LIST\n\n";
    
    // Add recipes used
    const selectedRecipeNames = selectedRecipes
      .filter(recipe => recipe.selected)
      .map(recipe => recipe.title);
    
    if (selectedRecipeNames.length > 0) {
      content += `Recipes: ${selectedRecipeNames.join(', ')}\n\n`;
    }
    
    // Add categories and items
    Object.entries(categories).forEach(([category, items]) => {
      content += `${category.toUpperCase()}:\n`;
      
      items.forEach(item => {
        const isChecked = checkedItems[item.name];
        const itemText = item.quantity && item.unit 
          ? `${item.quantity} ${item.unit} ${item.name}` 
          : item.name;
        
        content += `${isChecked ? '[x]' : '[ ]'} ${itemText}\n`;
      });
      
      content += "\n";
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share grocery list
  const shareGroceryList = async () => {
    if (!navigator.share) {
      alert('Web Share API is not supported in your browser');
      return;
    }
    
    let content = "GROCERY LIST\n\n";
    
    // Add recipes used
    const selectedRecipeNames = selectedRecipes
      .filter(recipe => recipe.selected)
      .map(recipe => recipe.title);
    
    if (selectedRecipeNames.length > 0) {
      content += `Recipes: ${selectedRecipeNames.join(', ')}\n\n`;
    }
    
    // Add categories and items
    Object.entries(categories).forEach(([category, items]) => {
      content += `${category.toUpperCase()}:\n`;
      
      items.forEach(item => {
        const itemText = item.quantity && item.unit 
          ? `${item.quantity} ${item.unit} ${item.name}` 
          : item.name;
        
        content += `- ${itemText}\n`;
      });
      
      content += "\n";
    });
    
    try {
      await navigator.share({
        title: 'My Grocery List',
        text: content
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaShoppingBasket className="mr-2 text-primary" />
          Smart Grocery List
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={printGroceryList}
            className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            title="Print Grocery List"
          >
            <FaPrint />
          </button>
          <button 
            onClick={downloadGroceryList}
            className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            title="Download as Text"
          >
            <FaDownload />
          </button>
          <button 
            onClick={shareGroceryList}
            className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
            title="Share Grocery List"
          >
            <FaShare />
          </button>
        </div>
      </div>
      
      {/* Recipe Selection */}
      {selectedRecipes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Recipes</h4>
          <div className="flex flex-wrap gap-2">
            {selectedRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => toggleRecipeSelection(recipe.id)}
                className={`px-3 py-1 rounded-full text-sm ${recipe.selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {recipe.title}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Grocery List */}
      <div className="space-y-6">
        {Object.keys(categories).length > 0 ? (
          Object.entries(categories).map(([category, items]) => (
            <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li 
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleItemChecked(item.name)}
                        className="mr-3 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary"
                      >
                        {checkedItems[item.name] ? <FaRegCheckCircle className="text-green-500" /> : <FaRegCircle />}
                      </button>
                      <span className={`${checkedItems[item.name] ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.quantity && item.unit 
                          ? `${item.quantity} ${item.unit} ${item.name}` 
                          : item.name}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeItem(item.name, category)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity"
                    >
                      <FaTrash size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {selectedRecipes.some(r => r.selected) 
              ? "No ingredients found in the selected recipes." 
              : "Select a recipe to generate a grocery list."}
          </div>
        )}
      </div>
      
      {/* Add Custom Item */}
      <div className="mt-6">
        {showAddItem ? (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Add Custom Item</h4>
            <div className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Item name"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
              <div className="flex items-center">
                <span className="mr-2 text-gray-700 dark:text-gray-300">Category:</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addCustomItem}
                  disabled={!newItem.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                >
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAddItem(true)}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Custom Item
          </button>
        )}
      </div>
      
      {/* Progress Indicator */}
      {Object.keys(categories).length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>
              {Object.values(checkedItems).filter(Boolean).length} / {groceryItems.length} items
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${groceryItems.length > 0 ? (Object.values(checkedItems).filter(Boolean).length / groceryItems.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartGroceryList;