import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page en cours de développement
          </h2>
          <p className="text-gray-500">
            Les paramètres de l'application seront bientôt disponibles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 