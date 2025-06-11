import { useState, useEffect } from 'react';
import { FaPlus, FaFolder, FaFolderOpen, FaEdit, FaTrash, FaBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../../../hooks/useAuth';

const RecipeCollection = ({ recipeId, recipeTitle }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollection, setEditingCollection] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockCollections = [
      {
        id: '1',
        name: 'Favorites',
        recipeCount: 12,
        hasCurrentRecipe: false,
      },
      {
        id: '2',
        name: 'Weeknight Dinners',
        recipeCount: 8,
        hasCurrentRecipe: true,
      },
      {
        id: '3',
        name: 'Holiday Recipes',
        recipeCount: 5,
        hasCurrentRecipe: false,
      },
    ];
    setCollections(mockCollections);
  }, [recipeId]);

  const handleCreateCollection = () => {
    if (!user) {
      toast.error('Please log in to create collections');
      return;
    }
    if (!newCollectionName.trim()) {
      toast.error('Collection name cannot be empty');
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName,
        recipeCount: 1, // Starting with this recipe
        hasCurrentRecipe: true,
      };

      setCollections([...collections, newCollection]);
      setNewCollectionName('');
      setShowCollectionModal(false);
      setLoading(false);
      toast.success(`Collection "${newCollectionName}" created and recipe added!`);
    }, 500);
  };

  const handleUpdateCollection = () => {
    if (!editingCollection || !newCollectionName.trim()) {
      toast.error('Collection name cannot be empty');
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      const updatedCollections = collections.map((collection) => {
        if (collection.id === editingCollection.id) {
          return { ...collection, name: newCollectionName };
        }
        return collection;
      });

      setCollections(updatedCollections);
      setNewCollectionName('');
      setEditingCollection(null);
      setShowCollectionModal(false);
      setLoading(false);
      toast.success('Collection updated successfully!');
    }, 500);
  };

  const handleDeleteCollection = (collectionId, collectionName) => {
    if (!window.confirm(`Are you sure you want to delete the collection "${collectionName}"?`)) {
      return;
    }

    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      const updatedCollections = collections.filter((collection) => collection.id !== collectionId);
      setCollections(updatedCollections);
      setLoading(false);
      toast.success(`Collection "${collectionName}" deleted successfully!`);
    }, 500);
  };

  const handleToggleRecipeInCollection = (collectionId, collectionName, hasRecipe) => {
    setLoading(true);
    // This would be an API call in a real implementation
    setTimeout(() => {
      const updatedCollections = collections.map((collection) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            hasCurrentRecipe: !hasRecipe,
            recipeCount: hasRecipe ? collection.recipeCount - 1 : collection.recipeCount + 1,
          };
        }
        return collection;
      });

      setCollections(updatedCollections);
      setLoading(false);
      toast.success(
        hasRecipe
          ? `Recipe removed from "${collectionName}"`
          : `Recipe added to "${collectionName}"`
      );
    }, 500);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setShowCollectionModal(true);
  };

  return (
    <div className="w-full">
      {/* Save to Collection Button */}
      <button
        onClick={() => setShowCollectionModal(true)}
        disabled={!user || loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
      >
        <FaBookmark />
        Save to Collection
      </button>

      {/* Collections List */}
      {collections.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Your Collections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  {collection.hasCurrentRecipe ? (
                    <FaFolderOpen className="text-primary" size={18} />
                  ) : (
                    <FaFolder className="text-gray-400 dark:text-gray-500" size={18} />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{collection.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {collection.recipeCount} {collection.recipeCount === 1 ? 'recipe' : 'recipes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRecipeInCollection(collection.id, collection.name, collection.hasCurrentRecipe)}
                    disabled={loading}
                    className={`p-2 rounded-full ${collection.hasCurrentRecipe
                      ? 'text-primary bg-primary/10 hover:bg-primary/20'
                      : 'text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } transition-colors`}
                    title={collection.hasCurrentRecipe ? 'Remove from collection' : 'Add to collection'}
                  >
                    <FaBookmark size={14} />
                  </button>
                  <button
                    onClick={() => openEditModal(collection)}
                    disabled={loading}
                    className="p-2 rounded-full text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Edit collection"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    disabled={loading}
                    className="p-2 rounded-full text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete collection"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </h3>
            <div className="mb-4">
              <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Collection Name
              </label>
              <input
                type="text"
                id="collectionName"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            {!editingCollection && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This recipe ({recipeTitle}) will be added to your new collection.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCollectionModal(false);
                  setNewCollectionName('');
                  setEditingCollection(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCollection ? handleUpdateCollection : handleCreateCollection}
                disabled={loading || !newCollectionName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Processing...'
                  : editingCollection
                    ? 'Update Collection'
                    : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCollection;