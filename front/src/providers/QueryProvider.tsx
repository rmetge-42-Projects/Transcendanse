'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  // On instancie le client React Query une seule fois pour éviter de réinitialiser le cache à chaque re-rendu
  const [queryClient] = useState(
    () => new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Garde les données "fraîches" pendant 5 minutes
            retry: 1, // En cas d'erreur réseau, réessaie 1 fois avant de déclarer un échec
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}