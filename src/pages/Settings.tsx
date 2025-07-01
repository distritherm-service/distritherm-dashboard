import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  UserCircle,
  Lock,
  Bell,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import type { UpdateUserInput } from '../types/user';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Formulaire profil utilisateur
  const [profileData, setProfileData] = useState<UpdateUserInput>({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    phoneNumber: user?.phoneNumber
  });

  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await userService.updateUser(user.id, profileData);
      showSuccess('Profil mis à jour avec succès');
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSavingProfile(false);
    }
  };

  // Préférences simples (locales)
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true
  });

  const togglePreference = (key: keyof typeof preferences) =>
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

  // Gestion mot de passe (non connecté à l'API pour l'instant)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  return (
    <div className="space-y-10">
      {/* Titre */}
      <div className="flex items-center gap-3">
        <SettingsIcon size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>
      </div>

      {/* Section Profil */}
      <section className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCircle size={28} className="text-emerald-500" />
          <h2 className="text-xl font-semibold text-gray-800">Profil utilisateur</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              value={profileData.firstName || ''}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName || ''}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="john.doe@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={profileData.phoneNumber || ''}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingProfile && <Loader2 className="animate-spin" size={18} />}
            <span>Enregistrer</span>
          </button>
        </div>
      </section>

      {/* Section Sécurité */}
      <section className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={28} className="text-emerald-500" />
          <h2 className="text-xl font-semibold text-gray-800">Sécurité</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="********"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="********"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="********"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-not-allowed"
            title="Fonctionnalité à venir"
          >
            Mettre à jour (bientôt)
          </button>
        </div>
      </section>

      {/* Section Préférences */}
      <section className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={28} className="text-emerald-500" />
          <h2 className="text-xl font-semibold text-gray-800">Préférences</h2>
        </div>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Mode sombre</p>
              <p className="text-sm text-gray-500">Interface foncée pour moins de fatigue visuelle</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={() => togglePreference('darkMode')}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white relative"
              />
            </label>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Notifications par email</p>
              <p className="text-sm text-gray-500">Recevoir des alertes importantes</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => togglePreference('emailNotifications')}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white relative"
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings; 