import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Promotion, CreatePromotionInput } from '../../types/promotion';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromotionInput) => void;
  promotion?: Promotion | null;
  mode: 'create' | 'edit';
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  mode,
}) => {
  const [formData, setFormData] = useState<CreatePromotionInput>({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: new Date(),
    endDate: undefined,
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePromotionInput, string>>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (promotion && mode === 'edit') {
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        isActive: promotion.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        startDate: new Date(),
        endDate: undefined,
        isActive: true,
      });
    }
    setErrors({});
  }, [promotion, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePromotionInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la promotion est requis';
    }
    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'La valeur de remise doit être supérieure à 0';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
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
      <div
        className={`bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ${
          isAnimating && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Nouvelle promotion' : 'Modifier la promotion'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]"
        >
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la promotion
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Soldes d'été"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Description de la promotion..."
            />
          </div>

          {/* Type & Valeur */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de remise
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as 'percentage' | 'fixed',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valeur
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: Number(e.target.value),
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.discountValue ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
              {errors.discountValue && (
                <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate.toISOString().substring(0, 10)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: new Date(e.target.value),
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin (optionnelle)
              </label>
              <input
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().substring(0, 10) : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActivePromotion"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="isActivePromotion" className="ml-2 text-sm text-gray-700">
              Promotion active
            </label>
          </div>

          {/* Boutons */}
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

export default PromotionModal; 