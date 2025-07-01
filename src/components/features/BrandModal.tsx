import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Brand, CreateBrandInput } from '../../types/brand';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBrandInput) => void;
  brand?: Brand | null;
  mode: 'create' | 'edit';
}

const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  brand,
  mode
}) => {
  const [formData, setFormData] = useState<CreateBrandInput>({
    name: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<CreateBrandInput>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (brand && mode === 'edit') {
      setFormData({
        name: brand.name,
        isActive: brand.isActive,
      });
    } else {
      setFormData({
        name: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [brand, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<CreateBrandInput> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la marque est requis';
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
            {mode === 'create' ? 'Nouvelle marque' : 'Modifier la marque'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la marque
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Daikin"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {mode === 'edit' && (
            <p className="text-sm text-gray-500">Seul le nom peut être modifié pour le moment.</p>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Marque active
            </label>
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

export default BrandModal; 