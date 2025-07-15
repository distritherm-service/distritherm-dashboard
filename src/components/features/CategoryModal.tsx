import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import type { Category, CreateCategoryInput } from '../../types/category';
import { useAgencies } from '../../hooks/useAgencies';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => void;
  category?: Category | null;
  mode: 'create' | 'edit';
  categories?: Category[]; // Pour sélectionner une catégorie parente
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  mode,
  categories = []
}) => {
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    imageUrl: '',
    level: 1,
    alias: '',
    haveParent: false,
    haveChildren: false,
    description: '',
    parentCategoryId: null,
    agenceId: 0,
    imageFile: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Chargement des agences pour l'affectation
  const { agencies: agenciesList, loading: loadingAgencies } = useAgencies();

  // Aperçu de l'image sélectionnée
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name,
        imageUrl: category.imageUrl || '',
        level: category.level || 1,
        alias: category.alias || '',
        haveParent: category.haveParent || false,
        haveChildren: category.haveChildren || false,
        description: category.description || '',
        parentCategoryId: category.parentCategoryId,
        agenceId: category.agenceId || 0,
        imageFile: undefined
      });
    } else {
      setFormData({
        name: '',
        imageUrl: '',
        level: 1,
        alias: '',
        haveParent: false,
        haveChildren: false,
        description: '',
        parentCategoryId: null,
        agenceId: 0,
        imageFile: undefined
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [category, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la catégorie est requis';
    }

    if (formData.name.length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (formData.alias && !/^[a-z0-9-]+$/.test(formData.alias)) {
      newErrors.alias = 'L\'alias ne peut contenir que des lettres minuscules, chiffres et tirets';
    }

    if (formData.level < 0) {
      newErrors.level = 'Le niveau doit être positif';
    }

    if (!formData.agenceId) {
      newErrors.agenceId = 'L\'agence est requise';
    }

    // Image requise uniquement à la création
    if (mode === 'create' && !formData.imageFile) {
      newErrors.imageFile = 'Une image est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Filtrer et trier les catégories pour éviter la sélection circulaire
  const availableParentCategories = categories
    .filter(cat => {
      if (mode === 'edit' && category) {
        // Éviter de sélectionner la catégorie elle-même ou ses enfants comme parent
        return cat.id !== category.id;
      }
      return true;
    })
    .sort((a, b) => {
      // Trier par niveau puis par nom
      const levelDiff = (a.level || 0) - (b.level || 0);
      if (levelDiff !== 0) return levelDiff;
      return a.name.localeCompare(b.name);
    });

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating && isOpen ? 'bg-black/30 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg w-full max-w-lg shadow-2xl transform transition-all duration-300 ${
        isAnimating && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Climatisation"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alias (URL)
            </label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.alias ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'alias-categorie'}
            />
            {errors.alias ? (
              <p className="mt-1 text-xs text-red-500">{errors.alias}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Si vide, sera généré automatiquement à partir du nom
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agence
            </label>
            <select
              value={formData.agenceId || ''}
              onChange={(e) => setFormData({ ...formData, agenceId: Number(e.target.value) })}
              disabled={loadingAgencies}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.agenceId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {loadingAgencies ? (
                <option value="">Chargement...</option>
              ) : (
                <>
                  <option value="">Sélectionner une agence</option>
                  {agenciesList.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.agenceId && (
              <p className="mt-1 text-xs text-red-500">{errors.agenceId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de catégorie
            </label>
            <div className="space-y-3">
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="categoryType"
                  checked={!formData.parentCategoryId}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      parentCategoryId: null,
                      haveParent: false,
                      level: 1
                    });
                  }}
                  className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Catégorie principale</span>
                  <p className="text-xs text-gray-500">Créer une nouvelle catégorie de niveau 1</p>
                </div>
              </label>
              
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="categoryType"
                  checked={!!formData.parentCategoryId}
                  onChange={() => {
                    if (availableParentCategories.length === 0) {
                      alert('Aucune catégorie parente disponible');
                      return;
                    }
                    // Sélectionner automatiquement la première catégorie disponible
                    const firstCategory = availableParentCategories[0];
                    if (firstCategory) {
                      setFormData({
                        ...formData,
                        parentCategoryId: firstCategory.id,
                        haveParent: true,
                        level: (firstCategory.level || 0) + 1
                      });
                    }
                  }}
                  className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500"
                  disabled={availableParentCategories.length === 0}
                />
                <div className={availableParentCategories.length === 0 ? 'opacity-50' : ''}>
                  <span className="font-medium text-gray-900">Sous-catégorie</span>
                  <p className="text-xs text-gray-500">
                    {availableParentCategories.length === 0 
                      ? 'Aucune catégorie parente disponible' 
                      : 'Créer une catégorie enfant d\'une catégorie existante'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {formData.parentCategoryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie parente
              </label>
              <select
                value={formData.parentCategoryId || ''}
                onChange={(e) => {
                  const parentId = Number(e.target.value);
                  const selectedParent = categories.find(c => c.id === parentId);
                  const newLevel = selectedParent ? (selectedParent.level || 0) + 1 : 1;
                  
                  setFormData({ 
                    ...formData, 
                    parentCategoryId: parentId,
                    level: newLevel
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableParentCategories.map((cat) => {
                  const catLevel = cat.level || 0;
                  const levelText = (catLevel === 0 || catLevel === 1) ? 'Catégorie 1' : 
                                   catLevel === 2 ? 'Sous-catégorie 1' :
                                   `Sous-catégorie ${catLevel - 1}`;
                  const indent = '  '.repeat(Math.max(0, catLevel - 1));
                  return (
                    <option key={cat.id} value={cat.id}>
                      {indent}{cat.name} ({levelText})
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Info size={12} className="mr-1" />
                Cette catégorie sera de {formData.level === 2 ? 'Sous-catégorie 1' : `Sous-catégorie ${formData.level - 1}`}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Décrivez brièvement la catégorie..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image (JPEG/PNG/WebP – max 5 Mo)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  setFormData({ ...formData, imageFile: file });
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.imageFile ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.imageFile && (
              <p className="mt-1 text-xs text-red-500">{errors.imageFile}</p>
            )}
            {imagePreview && (
              <img src={imagePreview} alt="prévisualisation" className="mt-2 h-24 w-24 object-cover rounded" />
            )}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-emerald-800 flex items-center">
              <Info size={16} className="mr-2" />
              Récapitulatif
            </h3>
            
            <div className="text-sm text-emerald-700">
              <p>
                Cette catégorie sera créée en tant que{' '}
                <span className="font-medium">
                  {formData.level === 1 ? 'Catégorie principale' : 
                   formData.level === 2 ? 'Sous-catégorie de niveau 1' :
                   `Sous-catégorie de niveau ${formData.level - 1}`}
                </span>
              </p>
              {formData.parentCategoryId && (
                <p className="mt-1">
                  Parent: <span className="font-medium">
                    {categories.find(c => c.id === formData.parentCategoryId)?.name}
                  </span>
                </p>
              )}
              {mode === 'edit' && formData.haveChildren && (
                <p className="mt-1 text-amber-600">
                  ⚠️ Cette catégorie possède des sous-catégories
                </p>
              )}
              {formData.agenceId && (
                <p className="mt-1">
                  Agence: <span className="font-medium">{agenciesList.find(a => Number(a.id) === formData.agenceId)?.name || 'N/A'}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              {mode === 'create' ? 'Créer' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal; 