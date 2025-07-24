import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  User as UserIcon,
  ArrowLeft,
  Download,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { quoteService } from '../services/quoteService';
import type { Quote, QuoteStatus } from '../types/quote';
import { useToast } from '../contexts/ToastContext';

// Fonctions utilitaires dupliquées (à terme, les sortir dans un helper si besoin)
const formatDateTime = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

const getStatusBadgeClass = (status: QuoteStatus) => {
  switch (status) {
    case 'SENDED':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROGRESS':
      return 'bg-purple-100 text-purple-800';
    case 'CONSULTED':
      return 'bg-indigo-100 text-indigo-800';
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: QuoteStatus) => {
  switch (status) {
    case 'SENDED':
      return 'Envoyé';
    case 'PENDING':
      return 'En attente';
    case 'PROGRESS':
      return 'En cours';
    case 'CONSULTED':
      return 'Consulté';
    case 'ACCEPTED':
      return 'Accepté';
    case 'REJECTED':
      return 'Refusé';
    default:
      return status;
  }
};

// Calcule le total TTC du devis (logique identique à useQuotes)
const calculateQuoteTotal = (quote: Quote): number => {
  if (typeof quote.cart.totalPrice === 'number') return quote.cart.totalPrice;

  const hasPriceTtc = quote.cart.cartItems.every((item) => typeof item.priceTtc === 'number');
  if (hasPriceTtc) {
    return quote.cart.cartItems.reduce((sum, item) => sum + (item.priceTtc || 0), 0);
  }

  return quote.cart.cartItems.reduce((total, item) => {
    const priceUnit = item.product.isInPromotion && item.product.promotionPrice
      ? item.product.promotionPrice
      : item.product.price;
    return total + priceUnit * item.quantity;
  }, 0);
};

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await quoteService.getQuoteById(Number(id));
      setQuote(response.devis);
    } catch (e: any) {
      const message = e instanceof Error ? e.message : 'Erreur lors du chargement du devis';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Téléchargement du fichier PDF si présent
  const handleDownload = async () => {
    if (!quote?.fileUrl) return;
    try {
      const blob = await quoteService.downloadQuoteFile(quote.fileUrl);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${quote.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      const message = e instanceof Error ? e.message : 'Erreur lors du téléchargement';
      showError(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Package size={32} className="text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Détails du devis</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={32} className="text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Devis #{quote.id}</h1>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(quote.status)}`}>
            {getStatusLabel(quote.status)}
          </span>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={18} /> Retour
        </button>
      </div>

      {/* Informations client & commercial */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Client */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <UserIcon size={20} className="text-emerald-500" /> Client
          </h2>
          <p className="text-sm text-gray-700 font-medium">
            {quote.cart.user.firstName} {quote.cart.user.lastName}
          </p>
          {quote.cart.user.companyName && (
            <p className="text-sm text-gray-500">Entreprise : {quote.cart.user.companyName}</p>
          )}
          {quote.cart.user.siretNumber && (
            <p className="text-sm text-gray-500">SIRET : {quote.cart.user.siretNumber}</p>
          )}
          {quote.cart.user.phoneNumber && (
            <p className="text-sm text-gray-500">Téléphone : {quote.cart.user.phoneNumber}</p>
          )}
          <p className="text-sm text-gray-500">{quote.cart.user.email}</p>
        </div>

        {/* Commercial */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <UserIcon size={20} className="text-purple-500" /> Commercial
          </h2>
          {quote.commercial ? (
            <>
              <p className="text-sm text-gray-700 font-medium">
                {quote.commercial.user.firstName} {quote.commercial.user.lastName}
              </p>
              <p className="text-sm text-gray-500">{quote.commercial.user.email}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Non assigné</p>
          )}
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total ligne</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quote.cart.cartItems.map((item) => {
              // Déterminer le prix unitaire : priorité à priceTtc s'il existe
              const unitPrice = typeof item.priceTtc === 'number'
                ? item.priceTtc / item.quantity
                : (item.product.isInPromotion && item.product.promotionPrice
                    ? item.product.promotionPrice
                    : item.product.price);

              // Calcul du total de la ligne
              const lineTotal = typeof item.priceTtc === 'number'
                ? item.priceTtc
                : unitPrice * item.quantity;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(unitPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatPrice(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Résumé */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Calendar size={18} />
          Créé le {formatDateTime(quote.createdAt)}
          {quote.endDate && (
            <span className="ml-2">| Validité jusqu'au {formatDateTime(quote.endDate)}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-800">
            Total : {formatPrice(calculateQuoteTotal(quote))}
          </span>
          {quote.fileUrl && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Download size={18} /> Télécharger le PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 