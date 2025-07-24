import React, { useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCommercialProfile } from '../hooks/useCommercialProfile.ts';

const CommercialProfile: React.FC = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const { user, loading, error, refresh } = useCommercialProfile(userId);

  // Rafraîchir lorsque l’ID change (par sécurité)
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  if (loading) {
    return <p>Chargement du profil...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user) {
    return <p>Aucune information trouvée.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserIcon size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-6 mb-8">
          {user.urlPicture ? (
            <img
              src={user.urlPicture}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm text-emerald-600 mt-2">Commercial</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Informations personnelles</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <span className="font-medium">Téléphone:</span> {user.phoneNumber || '—'}
              </li>
              <li>
                <span className="font-medium">Rôle:</span> {user.role}
              </li>
              <li>
                <span className="font-medium">Type:</span> {user.type}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialProfile; 