import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, TrendingUp, Package } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Commandes du jour',
      value: '24',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Nouveaux clients',
      value: '12',
      icon: Users,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Chiffre d\'affaires',
      value: '€3,450',
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Produits en stock',
      value: '587',
      icon: Package,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bgLight} p-3 rounded-lg`}>
                  <Icon size={24} className={stat.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-3">Bienvenue sur Distritherm Services</h2>
        <p className="text-emerald-100">
          Gérez efficacement votre boutique en ligne depuis ce tableau de bord.
          Toutes les fonctionnalités seront progressivement mises en place.
        </p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Activité récente</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <p className="text-gray-600">Nouvelle commande #1234 reçue</p>
            <span className="text-sm text-gray-400 ml-auto">Il y a 5 min</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-gray-600">Client Jean Dupont inscrit</p>
            <span className="text-sm text-gray-400 ml-auto">Il y a 15 min</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-gray-600">Stock produit mis à jour</p>
            <span className="text-sm text-gray-400 ml-auto">Il y a 30 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 