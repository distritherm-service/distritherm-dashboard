import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Agency, CreateAgencyInput } from '../../types/agency';

interface AgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAgencyInput) => void;
  agency?: Agency | null;
  mode: 'create' | 'edit';
}

const AgencyModal: React.FC<AgencyModalProps> = ({ isOpen, onClose, onSubmit, agency, mode }) => {
  const [formData, setFormData] = useState<CreateAgencyInput>({
    name: '',
    address: '',
    country: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateAgencyInput, string>>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  useEffect(() => {
    if (agency && mode === 'edit') {
      setFormData({
        name: agency.name,
        address: agency.address || '',
        country: agency.country || '',
        city: agency.city || '',
        postalCode: agency.postalCode || '',
        phoneNumber: agency.phoneNumber || '',
      });
    } else {
      setFormData({ name: '', address: '', country: '', city: '', postalCode: '', phoneNumber: '' });
    }
    setErrors({});
  }, [agency, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAgencyInput, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom de l\'agence est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isAnimating && isOpen ? 'bg-black/30 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg w-full max-w-lg shadow-2xl transform transition-all duration-300 ${isAnimating && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{mode === 'create' ? 'Créer une agence' : 'Modifier l\'agence'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'agence </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Agence Paris"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
              placeholder="12 rue de la Paix"
            />
          </div>
          {/* Pays & Ville */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
                placeholder="France"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
                placeholder="Paris"
              />
            </div>
          </div>
          {/* Code postal & Téléphone */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
                placeholder="75001"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400"
                placeholder="+33123456789"
              />
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

export default AgencyModal; 