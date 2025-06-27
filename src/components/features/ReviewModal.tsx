import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import type { Review } from '../../types/review';

interface ReviewModalProps {
  isOpen: boolean;
  review: Review | null;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string }) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, review, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setRating(review?.rating ?? 5);
      setComment(review?.comment ?? '');
    }
  }, [isOpen, review]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  if (!isOpen && !isAnimating) return null;

  const renderStarInput = () => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const value = idx + 1;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => setRating(value)}
            className="focus:outline-none"
          >
            <Star
              size={24}
              className={
                value <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
              }
            />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isAnimating && isOpen ? 'bg-black/30 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className={`bg-white rounded-lg w-full max-w-md shadow-2xl transform transition-all duration-300 ${
        isAnimating && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Modifier l'avis</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order & Customer (lecture seule) */}
          {review && (
            <div className="space-y-1 text-sm">
              <p className="text-gray-600"><span className="font-medium">Commande :</span> {review.orderNumber}</p>
              <p className="text-gray-600"><span className="font-medium">Client :</span> {review.customerName}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            {renderStarInput()}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Mettez à jour le commentaire..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal; 