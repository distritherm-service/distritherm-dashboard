import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Grid3X3,
  Tag,
  Star,
  Users,
  Building2,
  Loader2
} from 'lucide-react';

// Hooks
import { useProducts } from '../hooks/useProducts';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';
import { usePromotions } from '../hooks/usePromotions';
import { useReviews } from '../hooks/useReviews';
import { useClients } from '../hooks/useClients';
import { useAgencies } from '../hooks/useAgencies';

const Dashboard: React.FC = () => {
  // Chargement des données via les hooks existants
  const { meta: productsMeta, products, loading: productsLoading } = useProducts({ page: 1, limit: 5 });
  const { meta: brandsMeta, loading: brandsLoading } = useBrands({ page: 1, limit: 1 });
  const { categories, loading: categoriesLoading } = useCategories();
  const { meta: promotionsMeta, loading: promotionsLoading } = usePromotions({ page: 1, limit: 1 });
  const { meta: reviewsMeta, reviews, loading: reviewsLoading } = useReviews({ page: 1, limit: 5 });
  const { meta: clientsMeta, loading: clientsLoading } = useClients({ page: 1, limit: 1 });
  const { meta: agenciesMeta, loading: agenciesLoading } = useAgencies({ page: 1, limit: 1 });

  // Tableau de statistiques
  const stats = useMemo(() => [
    {
      id: 'products',
      title: 'Produits',
      value: productsMeta?.total ?? products?.length ?? 0,
      loading: productsLoading,
      icon: ShoppingBag,
      link: '/products',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      id: 'brands',
      title: 'Marques',
      value: brandsMeta?.total ?? 0,
      loading: brandsLoading,
      icon: Boxes,
      link: '/brands',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 'categories',
      title: 'Catégories',
      value: categories?.length ?? 0,
      loading: categoriesLoading,
      icon: Grid3X3,
      link: '/categories',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      id: 'promotions',
      title: 'Promotions',
      value: promotionsMeta?.total ?? 0,
      loading: promotionsLoading,
      icon: Tag,
      link: '/promotions',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      id: 'reviews',
      title: 'Avis',
      value: reviewsMeta?.total ?? 0,
      loading: reviewsLoading,
      icon: Star,
      link: '/reviews',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      id: 'clients',
      title: 'Clients',
      value: clientsMeta?.total ?? 0,
      loading: clientsLoading,
      icon: Users,
      link: '/clients',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      id: 'agencies',
      title: 'Agences',
      value: agenciesMeta?.total ?? 0,
      loading: agenciesLoading,
      icon: Building2,
      link: '/agencies',
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50'
    },
  ], [
    productsMeta, products, productsLoading,
    brandsMeta, brandsLoading,
    categories, categoriesLoading,
    promotionsMeta, promotionsLoading,
    reviewsMeta, reviewsLoading,
    clientsMeta, clientsLoading,
    agenciesMeta, agenciesLoading
  ]);

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div className="flex items-center gap-3 mb-4">
        <LayoutDashboard size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.id}
              to={stat.link}
              className="group bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-transparent hover:border-emerald-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  {stat.loading ? (
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  )}
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Deux colonnes : derniers produits & avis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers produits */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Derniers produits</h3>
          {productsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {products.slice(0, 5).map((product) => (
                <li key={product.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{product.name}</p>
                    <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                  </div>
                  <Link to="/products" className="text-emerald-500 text-xs font-medium hover:underline">Voir</Link>
                </li>
              ))}
              {products.length === 0 && (
                <li className="py-3 text-sm text-gray-400">Aucun produit disponible</li>
              )}
            </ul>
          )}
        </div>

        {/* Derniers avis */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Derniers avis</h3>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reviews.slice(0, 5).map((review) => (
                <li key={review.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-yellow-50 flex items-center justify-center">
                    <Star size={18} className="text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{review.productName ?? `Produit #${review.productId}`}</p>
                    <p className="text-xs text-gray-400">{review.customerName} • {review.rating} / 5</p>
                  </div>
                  <span className={
                    review.status === 'PENDING'
                      ? 'text-orange-500 text-xs'
                      : review.status === 'VALIDED'
                      ? 'text-emerald-500 text-xs'
                      : 'text-red-500 text-xs'
                  }>
                    {review.status}
                  </span>
                </li>
              ))}
              {reviews.length === 0 && (
                <li className="py-3 text-sm text-gray-400">Aucun avis disponible</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 