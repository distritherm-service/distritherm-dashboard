import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';
import { useCommercialQuotes } from '../hooks/useCommercialQuotes';
import { commercialQuoteService } from '../services/quoteService';
import { useToast } from '../../contexts/ToastContext';
import type { Quote, QuoteStatus } from '../../types/quote';

interface FileState {
  file?: File;
  endDate?: string;
}

const UploadQuote: React.FC = () => {
  const { quotes, loading, error, loadQuotes } = useCommercialQuotes({ limit: 20, status: undefined, page: 1 });
  const { showSuccess, showError } = useToast();
  const [files, setFiles] = useState<Record<number, FileState>>({});
  const [uploadingIds, setUploadingIds] = useState<number[]>([]);

  /* Pré-remplir la date de validité depuis le devis */
  useEffect(() => {
    if (quotes.length === 0) return;
    setFiles(prev => {
      const updated = { ...prev };
      quotes.forEach(q => {
        if (q.endDate) {
          const ymd = q.endDate.split('T')[0];
          if (!updated[q.id]) updated[q.id] = {};
          if (!updated[q.id].endDate) updated[q.id].endDate = ymd;
        }
      });
      return updated;
    });
  }, [quotes]);

  // Filtrer seulement les devis sans fichier associé
  const quotesToUpload = quotes.filter((q: Quote) => !q.fileUrl);

  const handleFileChange = (quoteId: number, fileList: FileList | null) => {
    if (!fileList || !fileList[0]) return;
    const file = fileList[0];
    if (file.type !== 'application/pdf') {
      showError('Veuillez sélectionner un fichier PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }
    setFiles(prev => ({ ...prev, [quoteId]: { ...prev[quoteId], file } }));
  };

  const handleDateChange = (quoteId: number, date: string) => {
    setFiles(prev => ({ ...prev, [quoteId]: { ...prev[quoteId], endDate: date } }));
  };

  const handleRemoveFile = (quoteId: number) => {
    setFiles(prev => {
      const updated = { ...prev };
      if (updated[quoteId]) {
        delete updated[quoteId].file;
        // Si aucune autre info, on peut supprimer l'entrée entière
        if (!updated[quoteId].endDate) {
          delete updated[quoteId];
        }
      }
      return updated;
    });
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result as string;
          // Vérifier que le résultat est bien une chaîne base64
          if (!result || typeof result !== 'string') {
            reject(new Error('Erreur lors de la lecture du fichier'));
            return;
          }
          // Garder le format complet avec le préfixe pour que le service puisse le nettoyer
          resolve(result);
        } catch (error) {
          reject(new Error('Erreur lors de la conversion du fichier'));
        }
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (quoteId: number) => {
    const fileState = files[quoteId];
    if (!fileState?.file) {
      showError('Veuillez sélectionner un fichier PDF.');
      return;
    }
    const quoteObj = quotes.find(q => q.id === quoteId);
    const endDateToSend = quoteObj?.endDate;
    if (!endDateToSend) {
      showError('Date de validité introuvable dans le devis.');
      return;
    }

    try {
      setUploadingIds(prev => [...prev, quoteId]);
      
      if (import.meta.env.DEV) {
        console.log('📎 Fichier sélectionné:', {
          name: fileState.file.name,
          size: fileState.file.size,
          sizeKB: Math.round(fileState.file.size / 1024),
          sizeMB: (fileState.file.size / 1024 / 1024).toFixed(2),
          type: fileState.file.type
        });
      }
      
      try {
        // Essayer d'abord avec JSON/Base64
        const base64 = await toBase64(fileState.file);
        
        if (import.meta.env.DEV) {
          console.log('📝 Tentative 1: Upload JSON/Base64');
        }
        
        await commercialQuoteService.uploadQuoteFile(quoteId, base64, endDateToSend);
        showSuccess('Devis envoyé avec succès.');
      } catch (jsonError: any) {
        console.error('❌ Échec upload JSON:', jsonError);
        
        // Si l'erreur est 413 ou contient "PDF requis", essayer avec FormData
        if (jsonError.message?.includes('413') || 
            jsonError.message?.includes('PDF requis') ||
            jsonError.message?.includes('volumineux')) {
          
          if (import.meta.env.DEV) {
            console.log('📝 Tentative 2: Upload FormData');
          }
          
          // Essayer avec FormData
          await commercialQuoteService.uploadQuoteFileFormData(quoteId, fileState.file, endDateToSend);
          showSuccess('Devis envoyé avec succès.');
        } else {
          // Si ce n'est pas une erreur qu'on peut résoudre avec FormData, la propager
          throw jsonError;
        }
      }
      
      // Recharger la liste
      loadQuotes({ page: 1, limit: 20 });
    } catch (e: any) {
      console.error('❌ Erreur finale upload:', e);
      let message = 'Erreur lors de l\'envoi du devis';
      if (e instanceof Error) {
        message = e.message;
      }
      showError(message);
    } finally {
      setUploadingIds(prev => prev.filter(id => id !== quoteId));
      // Nettoyer l'état local
      setFiles(prev => {
        const updated = { ...prev };
        delete updated[quoteId];
        return updated;
      });
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Upload size={32} className="text-emerald-500" />
        <h1 className="text-3xl font-bold text-gray-800">Envoyer un devis PDF</h1>
      </div>

      {/* Message d'information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informations importantes :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Seuls les fichiers PDF sont acceptés</li>
              <li>Taille maximale : 10 Mo par fichier</li>
              <li>L'upload peut prendre quelques instants pour les gros fichiers</li>
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">Chargement...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600 flex items-center justify-center gap-2"><AlertCircle /> {error}</div>
      ) : quotesToUpload.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Aucun devis à envoyer</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de validité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier PDF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotesToUpload.map((quote) => {
                const uploading = uploadingIds.includes(quote.id);
                return (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${quote.cart.user.firstName} ${quote.cart.user.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(quote.status)}`}>{getStatusLabel(quote.status)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.endDate ? new Date(quote.endDate).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {files[quote.id]?.file ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 truncate max-w-[140px]" title={files[quote.id]!.file!.name}>
                            {files[quote.id]!.file!.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Math.round(files[quote.id]!.file!.size / 1024)} KB)
                          </span>
                          <button onClick={() => handleRemoveFile(quote.id)} className="text-red-500 hover:text-red-700" title="Supprimer le fichier sélectionné">
                            <X size={16} />
                          </button>
                          <label className="cursor-pointer inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800">
                            <Upload size={16} />
                            <span className="underline">Modifier</span>
                            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileChange(quote.id, e.target.files)} />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <Upload size={16} />
                          <span>Sélectionner</span>
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileChange(quote.id, e.target.files)} />
                        </label>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        disabled={uploading || !files[quote.id]?.file}
                        onClick={() => handleUpload(quote.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm ${
                          uploading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : !files[quote.id]?.file
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                        title={!files[quote.id]?.file ? 'Veuillez d\'abord sélectionner un fichier PDF' : ''}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          'Envoyer'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadQuote; 