import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  /** Chemin vers la page "Mon profil" (par défaut '/profile') */
  profilePath?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, profilePath = '/profile' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fermer les menus en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  // Données fictives pour les notifications
  const notifications = [
    { id: 1, title: 'Nouvelle commande', message: 'Commande #1234 reçue', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Stock faible', message: 'Produit XYZ en rupture', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Client inscrit', message: 'Nouveau client enregistré', time: 'Il y a 2h', unread: false },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button + Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu size={24} />
            </button>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:bg-gray-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Menu des notifications */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={clsx(
                              'p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all duration-200',
                              notification.unread && 'bg-blue-50/30 border-l-4 border-l-blue-500'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          Aucune notification
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profil utilisateur */}
            <div ref={profileRef} className="relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'ADMIN' ? 'Administrateur' : user?.role || 'Client'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </button>

              {/* Menu déroulant du profil */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    {/* En-tête du menu */}
                    <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-emerald-100 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Options du menu */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate(profilePath);
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-150"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <User size={16} className="text-gray-600" />
                        </div>
                        <span className="font-medium">Mon profil</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-150"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Settings size={16} className="text-gray-600" />
                        </div>
                        <span className="font-medium">Paramètres</span>
                      </button>
                      
                      <div className="h-px bg-gray-100 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={16} />
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 