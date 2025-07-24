import React, { useState, useEffect } from 'react';
import { X, UserRound } from 'lucide-react';
import { useCommercials } from '../../hooks/useCommercials';
import type { User } from '../../types/user';

interface AssignCommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (commercialId: number) => Promise<void> | void;
  currentCommercialId?: number;
}

const AssignCommercialModal: React.FC<AssignCommercialModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  currentCommercialId,
}) => {
  const { commercials, loading } = useCommercials({ page: 1, limit: 100 });
  const [selectedId, setSelectedId] = useState<number | ''>(currentCommercialId ?? '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug : Logger les commerciaux chargés
  useEffect(() => {
    if (commercials.length > 0 && import.meta.env.DEV) {
      console.log('🔍 Commerciaux dans le modal:', commercials);
      commercials.forEach(c => {
        console.log(`🔍 Commercial: ID=${c.id}, Nom=${c.firstName} ${c.lastName}`);
      });
    }
  }, [commercials]);

  // Animation d'ouverture
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Réinitialiser la sélection lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentCommercialId ?? '');
    }
  }, [isOpen, currentCommercialId]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAssign(Number(selectedId));
      handleClose();
    } finally {
      setIsSubmitting(false);
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
        className={`bg-white rounded-lg w-full max-w-md shadow-2xl transform transition-all duration-300 ${
          isAnimating && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <UserRound size={24} className="text-emerald-600" />
            <h2 className="text-xl font-semibold">Assigner un commercial</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer p-1 rounded hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-center text-gray-500">Chargement des commerciaux...</p>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sélectionnez un commercial
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">-- Choisir --</option>
                {commercials.map((c: User) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} - {c.email} (ID: {c.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedId}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Assigner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignCommercialModal; 