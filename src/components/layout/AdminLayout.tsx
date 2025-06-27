import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Code,
  Tag,
  Grid3X3,
  Boxes,
  ShoppingBag,
  Building2,
  Settings,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'orders', label: 'Demandes reçues', icon: FileText, path: '/orders' },
  { id: 'order-details', label: 'Détails des commandes', icon: Package, path: '/order-details' },
  { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
  { id: 'agencies', label: 'Mes agences', icon: Building2, path: '/agencies' },
  
  { id: 'commercial', label: 'Commerciaux', icon: TrendingUp, path: '/commercial' },
  { id: 'categories', label: 'Catégories', icon: Grid3X3, path: '/categories' },
  { id: 'brands', label: 'Marques', icon: Boxes, path: '/brands' },
  { id: 'products', label: 'Gestion Produit', icon: ShoppingBag, path: '/products' },
  { id: 'promotions', label: 'Promotions', icon: Tag, path: '/promotions' },
  { id: 'reviews', label: 'Revues', icon: Star, path: '/reviews' },
  { id: 'calendar', label: 'Calendrier', icon: Calendar, path: '/calendar' },
  { id: 'contact', label: 'Contact Développeur', icon: Code, path: '/contact' },
];

const bottomMenuItems: MenuItem[] = [
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
];

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl z-40 flex flex-col',
          'lg:translate-x-0 transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-emerald-400 font-bold text-xl">Distritherm</h1>
                <p className="text-slate-400 text-sm">Admin Dashboard</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-20 bg-slate-700 text-white p-1.5 rounded-full shadow-lg hover:bg-slate-600 transition-colors"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </button>

        {/* Main Menu Items */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all duration-200',
                    'hover:bg-slate-700/50 hover:translate-x-1',
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-400'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Icon
                    size={20}
                    className={clsx(
                      'flex-shrink-0 transition-transform duration-200',
                      isActive && 'scale-110'
                    )}
                  />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && isSidebarOpen && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-6 border-t border-slate-700 pt-4">
          {/* Settings */}
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-2"
              >
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-slate-700/50 hover:translate-x-1',
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-400'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  <Icon
                    size={20}
                    className={clsx(
                      'flex-shrink-0 transition-transform duration-200',
                      isActive && 'scale-110'
                    )}
                  />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-red-400 hover:bg-red-500/20 hover:translate-x-1"
            >
              <LogOut
                size={20}
                className="flex-shrink-0 transition-transform duration-200"
              />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-medium text-sm"
                >
                  Déconnexion
                </motion.span>
              )}
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 border-t border-slate-700"
          >
            <p className="text-slate-400 text-xs text-center">
              © 2025 Distritherm Services
            </p>
          </motion.div>
        )}
      </motion.aside>

      {/* Main Content Wrapper */}
      <motion.div 
        className="flex-1 flex flex-col lg:ml-0" 
        initial={{ marginLeft: 0 }}
        animate={{ marginLeft: window.innerWidth >= 1024 ? (isSidebarOpen ? 280 : 80) : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header */}
        <Header onToggleMobileMenu={toggleMobileMenu} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </motion.div>

      {/* Mobile Overlay */}
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

export default AdminLayout; 