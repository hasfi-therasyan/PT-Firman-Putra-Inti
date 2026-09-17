'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <NavigationContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}