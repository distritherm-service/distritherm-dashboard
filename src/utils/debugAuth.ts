export const debugAuth = () => {
  console.group('🔐 Debug Authentification');
  
  // Vérifier les tokens
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  console.log('Access Token présent:', !!accessToken);
  if (accessToken) {
    console.log('Access Token (premiers caractères):', accessToken.substring(0, 20) + '...');
  }
  
  console.log('Refresh Token présent:', !!refreshToken);
  console.log('User présent:', !!user);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Erreur parsing user:', e);
    }
  }
  
  // Vérifier les cookies
  console.log('Cookies:', document.cookie);
  
  console.groupEnd();
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user
  };
}; 