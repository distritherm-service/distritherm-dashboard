import React from 'react';
import Header from '../../components/layout/Header';

interface CommercialHeaderProps {
  onToggleMobileMenu?: () => void;
}

/**
 * Header spécifique à l’interface Commercial.
 * Pour l’instant il réutilise exactement le composant Header générique
 * mais offre un point d’extension pour de futures personnalisations
 * sans impacter l’interface Admin.
 */
const CommercialHeader: React.FC<CommercialHeaderProps> = ({ onToggleMobileMenu }) => {
  return <Header onToggleMobileMenu={onToggleMobileMenu} profilePath="/commercial/profile" />;
};

export default CommercialHeader; 