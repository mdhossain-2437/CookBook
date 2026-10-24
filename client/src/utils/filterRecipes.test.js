import assert from 'node:assert/strict';
import test from 'node:test';
import { filterRecipes } from './filterRecipes.js';

const recipes = [
  { title: 'Tomato Pasta', cuisineType: 'Italian', categories: ['Dinner', 'Vegan'], createdAt: '2026-10-20' },
  { title: 'Breakfast Tacos', cuisineType: 'Mexican', categories: ['Breakfast'], createdAt: '2026-10-21' },
  { title: 'Chickpea Curry', cuisineType: 'Indian', categories: ['Dinner', 'Vegan'], createdAt: '2026-10-22' },
];
const defaults = { search: '', cuisine: '', category: '', sortOrder: 'desc' };

test('shows all recipes newest first without mutating the source', () => {
  assert.deepEqual(filterRecipes(recipes, defaults), [...recipes].reverse());
  assert.equal(recipes[0].title, 'Tomato Pasta');
});

test('matches submitted search text regardless of case or outer whitespace', () => {
  assert.deepEqual(filterRecipes(recipes, { ...defaults, search: '  PASTA  ' }), [recipes[0]]);
});

test('combines cuisine and category filters', () => {
  assert.deepEqual(filterRecipes(recipes, { ...defaults, cuisine: 'Indian', category: 'Vegan' }), [recipes[2]]);
  assert.deepEqual(filterRecipes(recipes, { ...defaults, cuisine: 'Italian', category: 'Breakfast' }), []);
});

test('supports oldest first and restoring cleared filters', () => {
  assert.deepEqual(filterRecipes(recipes, { ...defaults, sortOrder: 'asc' }), recipes);
  assert.equal(filterRecipes(recipes, { ...defaults, search: 'no match' }).length, 0);
  assert.equal(filterRecipes(recipes, defaults).length, 3);
});

test('handles an empty collection and missing optional categories', () => {
  assert.deepEqual(filterRecipes([], defaults), []);
  assert.deepEqual(filterRecipes([{ title: 'Soup', createdAt: '2026-10-20' }], { ...defaults, category: 'Dinner' }), []);
});
