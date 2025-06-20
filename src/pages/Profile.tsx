import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-emerald-600 mt-2">Administrateur</p>
          </div>
        </div>

        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Page en cours de développement
          </h3>
          <p className="text-gray-500">
            Les fonctionnalités de profil seront bientôt disponibles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 