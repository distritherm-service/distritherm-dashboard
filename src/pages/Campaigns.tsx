import React, { useState } from 'react';
import { campaignService } from '../services/campaignService';
import { useToast } from '../contexts/ToastContext';

const Campaigns: React.FC = () => {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      showToast('Le sujet et le contenu sont requis.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await campaignService.sendCampaign({ subject, content });
      showToast('Campagne envoyée avec succès.', 'success');
      setSubject('');
      setContent('');
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('Une erreur est survenue.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold mb-6">Nouvelle campagne marketing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Sujet
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            placeholder="Sujet de l'email"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenu HTML
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full h-60 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-mono"
            placeholder="<p>Bonjour...</p>"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Vous pouvez saisir du HTML pour mettre en forme votre message.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer la campagne'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Campaigns; 