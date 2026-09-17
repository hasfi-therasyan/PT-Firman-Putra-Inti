'use client';

import { Suspense } from 'react';
import RouteLoader from './RouteLoader';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div />}>
      <RouteLoader>{children}</RouteLoader>
    </Suspense>
  );
}