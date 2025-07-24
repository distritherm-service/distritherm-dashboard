import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, LogOut, Upload } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import CommercialHeader from './CommercialHeader';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

// Menu restreint pour les commerciaux
const menuItems: MenuItem[] = [
  { id: 'orders', label: 'Demandes reçues', icon: FileText, path: '/commercial/orders' },
  { id: 'upload', label: 'Envoyer devis', icon: Upload, path: '/commercial/upload' },
];

const CommercialLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 240 : 76 }}
        animate={{ width: isSidebarOpen ? 240 : 76 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'fixed left-0 top-0 h-full bg-slate-900 shadow-xl z-40 flex flex-col',
          'lg:translate-x-0 transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          {isSidebarOpen && <h1 className="text-emerald-400 font-bold text-lg">Distritherm</h1>}
        </div>

        {/* Menu */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all duration-200',
                    'hover:bg-slate-700/50 hover:translate-x-1',
                    isActive ? 'bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-400' : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Icon size={20} className={clsx('flex-shrink-0', isActive && 'scale-110')} />
                  {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 pb-6 border-t border-slate-700 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-red-400 hover:bg-red-500/20 hover:translate-x-1"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* Contenu principal */}
      <motion.div
        className="flex-1 flex flex-col lg:ml-0"
        initial={{ marginLeft: 0 }}
        animate={{ marginLeft: window.innerWidth >= 1024 ? (isSidebarOpen ? 240 : 76) : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header spécifique Commercial */}
        <CommercialHeader onToggleMobileMenu={toggleMobileMenu} />

        {/* Contenu */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6 lg:p-8">
          <Outlet />
        </main>
      </motion.div>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
};

export default CommercialLayout; 