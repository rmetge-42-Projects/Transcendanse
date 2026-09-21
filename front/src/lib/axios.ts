import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://localhost:8443/api', // nginx (docker-compose) expose le 443 du conteneur sur le 8443 du host
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cet intercepteur s'exécute automatiquement AVANT chaque requête sortante
api.interceptors.request.use(
  (config) => {
    // 1. On vérifie d'abord qu'on est bien dans le navigateur (côté client)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);