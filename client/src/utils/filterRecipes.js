export const filterRecipes = (recipes, { search, cuisine, category, sortOrder }) => {
  const query = search.trim().toLowerCase();

  return recipes
    .filter((recipe) =>
      recipe.title.toLowerCase().includes(query) &&
      (!cuisine || recipe.cuisineType === cuisine) &&
      (!category || recipe.categories?.includes(category))
    )
    .sort((a, b) => {
      const difference = new Date(a.createdAt) - new Date(b.createdAt);
      return sortOrder === 'asc' ? difference : -difference;
    });
};
