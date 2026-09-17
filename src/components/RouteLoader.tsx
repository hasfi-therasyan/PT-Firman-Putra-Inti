'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader on route change
    setLoading(true);
    // Hide after minimal delay to avoid flicker on fast navigations
    const timer = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return <LoadingOverlay isLoading={loading}>{children}</LoadingOverlay>;
}