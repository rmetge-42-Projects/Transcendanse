import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://localhost/api', // L'URL où tourne ton backend NestJS
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