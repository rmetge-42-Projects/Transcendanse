import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000', // L'URL où tourne ton backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});