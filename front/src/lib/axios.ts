import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // L'URL où tourne ton backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cet intercepteur s'exécute automatiquement AVANT chaque requête sortante
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';

    // Les routes de connexion renvoient aussi 401 pour un mauvais mot de passe :
    // il ne faut pas rediriger dans ce cas, juste laisser la page afficher le message
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/2fa/verify-login');

    if (status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);