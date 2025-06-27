import React, { useState, useEffect } from 'react';
import { X, Building2, CreditCard, Image } from 'lucide-react';
import type { User, CreateUserInput } from '../../types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => void;
  user?: User | null;
  mode: 'create' | 'edit';
  forcedRole?: 'CLIENT' | 'ADMIN' | 'COMMERCIAL';
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user, mode, forcedRole }) => {
  const [formData, setFormData] = useState<CreateUserInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: forcedRole || 'CLIENT',
    companyName: '',
    siretNumber: '',
    urlPicture: ''
  });

  const [errors, setErrors] = useState<Partial<CreateUserInput>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        phoneNumber: user.phoneNumber,
        role: forcedRole || user.role,
        companyName: user.companyName || '',
        siretNumber: user.siretNumber || '',
        urlPicture: user.urlPicture || ''
      });
      setShowCompanyFields(!!(user.companyName || user.siretNumber));
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: forcedRole || 'CLIENT',
        companyName: '',
        siretNumber: '',
        urlPicture: ''
      });
      setShowCompanyFields(false);
    }
    setErrors({});
  }, [user, mode, isOpen, forcedRole]);

  const validate = (): boolean => {
    const newErrors: Partial<CreateUserInput> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'Le prénom ne doit pas dépasser 50 caractères';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Le nom ne doit pas dépasser 50 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (mode === 'create' && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (mode === 'create' && formData.password) {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      }
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis';
    } else if (!/^\+33[0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Format: +33 suivi de 9 chiffres (ex: +33612345678)';
    }

    if (formData.urlPicture && formData.urlPicture.trim()) {
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(formData.urlPicture)) {
        newErrors.urlPicture = 'L\'URL doit être une image valide (jpg, jpeg, png, webp)';
      }
    }

    if (formData.role === 'CLIENT' && showCompanyFields) {
      if (formData.companyName && formData.companyName.trim()) {
        if (formData.companyName.length > 100) {
          newErrors.companyName = 'Le nom de l\'entreprise ne doit pas dépasser 100 caractères';
        }
      }

      if (formData.siretNumber && formData.siretNumber.trim()) {
        if (!/^[0-9]{14}$/.test(formData.siretNumber.replace(/\s/g, ''))) {
          newErrors.siretNumber = 'Le numéro SIRET doit contenir exactement 14 chiffres';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        setIsSubmitting(false);
      } catch (error) {
        setIsSubmitting(false);
      }
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
            {mode === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mot de passe sécurisé"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
              {!errors.password && (
                <p className="mt-1 text-xs text-gray-500">
                  Min. 6 caractères avec majuscule, minuscule et chiffre
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+33612345678"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
            )}
            {!errors.phoneNumber && (
              <p className="mt-1 text-xs text-gray-500">Format: +33 suivi de 9 chiffres</p>
            )}
          </div>

          {!forcedRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CLIENT' | 'ADMIN' | 'COMMERCIAL' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Administrateur</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
          )}

          {formData.role === 'CLIENT' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCompanyFields"
                checked={showCompanyFields}
                onChange={(e) => setShowCompanyFields(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="showCompanyFields" className="text-sm text-gray-700">
                Informations d'entreprise (optionnel)
              </label>
            </div>
          )}

          {formData.role === 'CLIENT' && showCompanyFields && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building2 size={16} className="inline mr-1" />
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ma Société SARL"
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Max. 100 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard size={16} className="inline mr-1" />
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  value={formData.siretNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (/^\d*$/.test(value) && value.length <= 14) {
                      setFormData({ ...formData, siretNumber: value });
                    }
                  }}
                  placeholder="12345678901234"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.siretNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.siretNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.siretNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Exactement 14 chiffres</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Image size={16} className="inline mr-1" />
              URL de l'image de profil (optionnel)
            </label>
            <input
              type="url"
              value={formData.urlPicture || ''}
              onChange={(e) => setFormData({ ...formData, urlPicture: e.target.value })}
              placeholder="https://exemple.com/photo.jpg"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.urlPicture ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.urlPicture && (
              <p className="mt-1 text-xs text-red-500">{errors.urlPicture}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Formats acceptés: jpg, jpeg, png, webp</p>
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
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal; 