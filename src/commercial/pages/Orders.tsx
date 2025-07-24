import React, { useState } from 'react';
import { FileText, Eye, Download, AlertCircle } from 'lucide-react';
import { useCommercialQuotes } from '../hooks/useCommercialQuotes';
import { useNavigate } from 'react-router-dom';
import type { QuoteStatus, Quote, CartItem } from '../../types/quote';

// Helper pour formater le prix en EUR
const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

// Calcule le total TTC d'un devis (copié de la logique de useQuotes)
const calculateQuoteTotal = (quote: Quote): number => {
  if (typeof quote.cart.totalPrice === 'number') return quote.cart.totalPrice;

  const hasPriceTtc = quote.cart.cartItems.every((item: CartItem) => typeof item.priceTtc === 'number');
  if (hasPriceTtc) {
    return quote.cart.cartItems.reduce((sum: number, item: CartItem) => sum + (item.priceTtc || 0), 0);
  }

  return quote.cart.cartItems.reduce((total: number, item: CartItem) => {
    const priceUnit = item.product.isInPromotion && item.product.promotionPrice
      ? item.product.promotionPrice
      : item.product.price;
    return total + priceUnit * item.quantity;
  }, 0);
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | ''>('');
  const { quotes, loading, error, meta, loadQuotes, downloadQuoteFile } = useCommercialQuotes({ limit: 10, status: undefined, page: 1 });

  const getStatusBadgeClass = (status: QuoteStatus) => {
    switch (status) {
      case 'SENDED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'ACCEPTED':
        return 'Accepté';
      case 'REJECTED':
        return 'Refusé';
      default:
        return status;
    }
  };

  const handleStatusChange = (val: QuoteStatus | '') => {
    setStatusFilter(val);
    loadQuotes({ page: 1, limit: 10, status: val || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Mes devis</h1>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value as QuoteStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tous les statuts</option>
          <option value="SENDED">Envoyé</option>
          <option value="PENDING">En attente</option>
          <option value="ACCEPTED">Accepté</option>
          <option value="REJECTED">Refusé</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Chargement...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 flex items-center justify-center gap-2"><AlertCircle /> {error}</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun devis</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${quote.cart.user.firstName} ${quote.cart.user.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(quote.status)}`}>{getStatusLabel(quote.status)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(calculateQuoteTotal(quote))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                      <button className="text-emerald-600 hover:text-emerald-900" onClick={() => navigate(`/commercial/orders/${quote.id}`)}><Eye size={16} /></button>
                      {quote.fileUrl && <button className="text-blue-600 hover:text-blue-900" onClick={() => downloadQuoteFile(quote.fileUrl!, `devis-${quote.id}.pdf`)}><Download size={16} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 