import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8443';
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
});