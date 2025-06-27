import { useState, useEffect } from 'react';
import type { Category } from '../types/category';
import { getCategories } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryTree = () => {
    return categories.sort((a, b) => {
      const levelDiff = (a.level || 0) - (b.level || 0);
      if (levelDiff !== 0) return levelDiff;
      return a.name.localeCompare(b.name);
    });
  };

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  const getCategoryLevel = (level: number): string => {
    if (level === 0 || level === 1) return 'Catégorie 1';
    if (level === 2) return 'Sous-catégorie 1';
    return `Sous-catégorie ${level - 1}`;
  };

  const getCategoryChildren = (parentId: number): Category[] => {
    return categories.filter(cat => cat.parentCategoryId === parentId);
  };

  const getCategoryWithChildren = (categoryId: number): Category[] => {
    const result: Category[] = [];
    
    const addCategoryAndChildren = (id: number) => {
      const category = categories.find(cat => cat.id === id);
      if (category) {
        result.push(category);
        const children = getCategoryChildren(id);
        children.forEach(child => addCategoryAndChildren(child.id));
      }
    };
    
    addCategoryAndChildren(categoryId);
    return result;
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    getCategoryTree,
    getCategoryById,
    getCategoryLevel,
    getCategoryChildren,
    getCategoryWithChildren
  };
}; 