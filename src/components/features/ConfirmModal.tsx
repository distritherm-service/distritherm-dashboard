import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  additionalInfo?: string[];
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
  additionalInfo = [],
  isLoading = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    // Ne pas permettre la fermeture si en cours de chargement
    if (isLoading) return;
    
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfirm = () => {
    // Appeler onConfirm sans fermer le modal
    // Le parent gèrera la fermeture
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Fermer le modal si on clique sur le backdrop
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen && !isAnimating) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating && isOpen ? 'bg-black/30 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg w-full max-w-md shadow-2xl transform transition-all duration-300 ${
        isAnimating && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className={styles.icon} />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed p-1 rounded hover:bg-gray-100"
            title={isLoading ? "Suppression en cours..." : "Fermer"}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700">{message}</p>
          
          {additionalInfo.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">Attention :</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {additionalInfo.map((info, index) => (
                      <li key={index}>• {info}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`flex gap-3 p-6 pt-0 ${!cancelText ? 'justify-center' : ''}`}>
          {cancelText && (
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${cancelText ? 'flex-1' : 'px-8'} px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.button} flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 