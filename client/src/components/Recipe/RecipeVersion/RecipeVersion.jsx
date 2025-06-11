import { useState, useEffect } from 'react';
import { FaHistory, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaUser, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RecipeVersion = ({ recipeId, currentVersion }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState({
    left: null,
    right: null,
  });

  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch recipe versions from an API
    const fetchVersions = async () => {
      setLoading(true);
      try {
        // Mock data
        const mockVersions = [
          {
            id: 'v3',
            versionNumber: 3,
            createdAt: '2023-06-15T10:30:00Z',
            createdBy: {
              id: 'user1',
              name: 'John Doe',
            },
            changes: [
              'Reduced sugar from 1 cup to 3/4 cup',
              'Added vanilla extract',
              'Increased baking time by 5 minutes',
            ],
            ingredients: [
              { name: 'Flour', amount: '2 cups' },
              { name: 'Sugar', amount: '3/4 cup' },
              { name: 'Butter', amount: '1/2 cup' },
              { name: 'Eggs', amount: '2' },
              { name: 'Vanilla Extract', amount: '1 tsp' },
            ],
            instructions: [
              'Preheat oven to 350°F (175°C)',
              'Mix dry ingredients in a bowl',
              'Beat butter and sugar until fluffy',
              'Add eggs one at a time, then vanilla',
              'Gradually add dry ingredients',
              'Bake for 30 minutes',
            ],
          },
          {
            id: 'v2',
            versionNumber: 2,
            createdAt: '2023-05-20T14:45:00Z',
            createdBy: {
              id: 'user1',
              name: 'John Doe',
            },
            changes: [
              'Added an extra egg for moisture',
              'Reduced baking temperature',
            ],
            ingredients: [
              { name: 'Flour', amount: '2 cups' },
              { name: 'Sugar', amount: '1 cup' },
              { name: 'Butter', amount: '1/2 cup' },
              { name: 'Eggs', amount: '2' },
            ],
            instructions: [
              'Preheat oven to 350°F (175°C)',
              'Mix dry ingredients in a bowl',
              'Beat butter and sugar until fluffy',
              'Add eggs one at a time',
              'Gradually add dry ingredients',
              'Bake for 25 minutes',
            ],
          },
          {
            id: 'v1',
            versionNumber: 1,
            createdAt: '2023-04-10T09:15:00Z',
            createdBy: {
              id: 'user1',
              name: 'John Doe',
            },
            changes: ['Original recipe'],
            ingredients: [
              { name: 'Flour', amount: '2 cups' },
              { name: 'Sugar', amount: '1 cup' },
              { name: 'Butter', amount: '1/2 cup' },
              { name: 'Egg', amount: '1' },
            ],
            instructions: [
              'Preheat oven to 375°F (190°C)',
              'Mix dry ingredients in a bowl',
              'Beat butter and sugar until fluffy',
              'Add egg',
              'Gradually add dry ingredients',
              'Bake for 25 minutes',
            ],
          },
        ];

        setVersions(mockVersions);
        setSelectedVersion(mockVersions[0]); // Set the latest version as selected
      } catch (error) {
        console.error('Error fetching recipe versions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [recipeId]);

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    if (compareMode) {
      if (!compareVersions.left) {
        setCompareVersions({ ...compareVersions, left: version });
      } else if (!compareVersions.right) {
        setCompareVersions({ ...compareVersions, right: version });
      } else {
        // If both are already selected, replace the right one
        setCompareVersions({ ...compareVersions, right: version });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      // When entering compare mode, initialize with the current version and the previous one if available
      const currentIndex = versions.findIndex(v => v.id === selectedVersion.id);
      const prevIndex = currentIndex < versions.length - 1 ? currentIndex + 1 : null;
      
      setCompareVersions({
        left: versions[currentIndex],
        right: prevIndex !== null ? versions[prevIndex] : null,
      });
    } else {
      // When exiting compare mode, reset
      setCompareVersions({ left: null, right: null });
    }
  };

  const renderVersionTimeline = () => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Version History</h3>
          <button
            onClick={() => setShowVersionHistory(false)}
            className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
          >
            <FaArrowLeft className="mr-1 inline" /> Back to Recipe
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>

          {/* Version items */}
          <div className="space-y-4">
            {versions.map((version) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative pl-10 py-3 px-4 rounded-lg cursor-pointer transition-colors ${selectedVersion?.id === version.id
                  ? 'bg-primary/10 border-l-4 border-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                onClick={() => handleVersionSelect(version)}
              >
                {/* Timeline dot */}
                <div className="absolute left-3 top-5 w-3 h-3 rounded-full bg-primary"></div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      Version {version.versionNumber}
                      {version.versionNumber === versions[0].versionNumber && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">
                          Latest
                        </span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <FaCalendarAlt className="mr-1" size={12} />
                      {formatDate(version.createdAt)}
                      <span className="mx-2">•</span>
                      <FaUser className="mr-1" size={12} />
                      {version.createdBy.name}
                    </div>
                  </div>

                  {compareMode && (
                    <div className="mt-2 sm:mt-0">
                      <button
                        className={`px-3 py-1 rounded-full text-xs ${compareVersions.left?.id === version.id
                          ? 'bg-blue-500 text-white'
                          : compareVersions.right?.id === version.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (compareVersions.left?.id === version.id) {
                            setCompareVersions({ ...compareVersions, left: null });
                          } else if (compareVersions.right?.id === version.id) {
                            setCompareVersions({ ...compareVersions, right: null });
                          } else if (!compareVersions.left) {
                            setCompareVersions({ ...compareVersions, left: version });
                          } else if (!compareVersions.right) {
                            setCompareVersions({ ...compareVersions, right: version });
                          } else {
                            // If both are selected, replace the right one
                            setCompareVersions({ ...compareVersions, right: version });
                          }
                        }}
                      >
                        {compareVersions.left?.id === version.id
                          ? 'Left Side'
                          : compareVersions.right?.id === version.id
                            ? 'Right Side'
                            : 'Select for Compare'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Changes:</h5>
                  <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {version.changes.map((change, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVersionDetails = () => {
    if (!selectedVersion) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Version {selectedVersion.versionNumber}
            {selectedVersion.versionNumber === versions[0].versionNumber && (
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">
                Latest
              </span>
            )}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={toggleCompareMode}
              className={`px-3 py-1 rounded-lg text-sm flex items-center ${compareMode
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              <FaHistory className="mr-1" />
              {compareMode ? 'Exit Compare' : 'Compare Versions'}
            </button>
            <button
              onClick={() => setShowVersionHistory(true)}
              className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
            >
              <FaEye className="mr-1" />
              View History
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex items-center">
          <FaCalendarAlt className="mr-1" />
          Created on {formatDate(selectedVersion.createdAt)}
          <span className="mx-2">•</span>
          <FaUser className="mr-1" />
          By {selectedVersion.createdBy.name}
        </div>

        {!compareMode ? (
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Ingredients</h4>
              <ul className="space-y-2">
                {selectedVersion.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="text-gray-800 dark:text-gray-200">{ingredient.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{ingredient.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Instructions</h4>
              <ol className="space-y-3">
                {selectedVersion.instructions.map((instruction, index) => (
                  <li key={index} className="pl-6 relative">
                    <span className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <div>
            {(!compareVersions.left || !compareVersions.right) ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  {!compareVersions.left && !compareVersions.right
                    ? 'Select two versions to compare'
                    : !compareVersions.left
                      ? 'Select a version for the left side'
                      : 'Select a version for the right side'}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-l-lg">
                    <h5 className="font-medium text-blue-800 dark:text-blue-300">
                      Version {compareVersions.left.versionNumber}
                    </h5>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {formatDate(compareVersions.left.createdAt)}
                    </p>
                  </div>
                  <div className="text-center flex-1 bg-green-100 dark:bg-green-900/30 p-2 rounded-r-lg">
                    <h5 className="font-medium text-green-800 dark:text-green-300">
                      Version {compareVersions.right.versionNumber}
                    </h5>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {formatDate(compareVersions.right.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Ingredients Comparison */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Ingredients</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {compareVersions.left.ingredients.map((ingredient, index) => {
                          const rightIngredient = compareVersions.right.ingredients.find(
                            (i) => i.name === ingredient.name
                          );
                          const isChanged = rightIngredient && rightIngredient.amount !== ingredient.amount;
                          const isNew = !rightIngredient;

                          return (
                            <li
                              key={index}
                              className={`flex justify-between ${isChanged ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''} ${isNew ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                            >
                              <span>{ingredient.name}</span>
                              <span>
                                {ingredient.amount}
                                {isNew && ' (New)'}
                                {isChanged && ' (Changed)'}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {compareVersions.right.ingredients.map((ingredient, index) => {
                          const leftIngredient = compareVersions.left.ingredients.find(
                            (i) => i.name === ingredient.name
                          );
                          const isChanged = leftIngredient && leftIngredient.amount !== ingredient.amount;
                          const isRemoved = !leftIngredient;

                          return (
                            <li
                              key={index}
                              className={`flex justify-between ${isChanged ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''} ${isRemoved ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}
                            >
                              <span>{ingredient.name}</span>
                              <span>
                                {ingredient.amount}
                                {isRemoved && ' (Removed)'}
                                {isChanged && ' (Changed)'}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Instructions Comparison */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Instructions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <ol className="space-y-3">
                        {compareVersions.left.instructions.map((instruction, index) => {
                          const rightInstruction = compareVersions.right.instructions[index];
                          const isChanged = rightInstruction && rightInstruction !== instruction;
                          const isNew = index >= compareVersions.right.instructions.length;

                          return (
                            <li
                              key={index}
                              className={`pl-6 relative ${isChanged ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''} ${isNew ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                            >
                              <span className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
                                {index + 1}
                              </span>
                              <p>
                                {instruction}
                                {isNew && ' (New)'}
                                {isChanged && ' (Changed)'}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <ol className="space-y-3">
                        {compareVersions.right.instructions.map((instruction, index) => {
                          const leftInstruction = compareVersions.left.instructions[index];
                          const isChanged = leftInstruction && leftInstruction !== instruction;
                          const isRemoved = index >= compareVersions.left.instructions.length;

                          return (
                            <li
                              key={index}
                              className={`pl-6 relative ${isChanged ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''} ${isRemoved ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}
                            >
                              <span className="absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                                {index + 1}
                              </span>
                              <p>
                                {instruction}
                                {isRemoved && ' (Removed)'}
                                {isChanged && ' (Changed)'}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <FaHistory className="mr-2 text-primary" />
          Recipe Versions
        </h2>

        {showVersionHistory ? renderVersionTimeline() : renderVersionDetails()}
      </div>
    </div>
  );
};

export default RecipeVersion;