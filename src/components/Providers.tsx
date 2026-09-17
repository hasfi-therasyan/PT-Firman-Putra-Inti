'use client';

import { Suspense } from 'react';
import { NavigationProvider, useNavigation } from './NavigationContext';
import RouteLoader from './RouteLoader';

function RouteLoaderWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading: externalLoading } = useNavigation();
  return <RouteLoader externalLoading={externalLoading}>{children}</RouteLoader>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <Suspense fallback={<div />}>
        <RouteLoaderWrapper>{children}</RouteLoaderWrapper>
      </Suspense>
    </NavigationProvider>
  );
}