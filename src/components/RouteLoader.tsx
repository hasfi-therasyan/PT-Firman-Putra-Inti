'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';

interface Props {
  children: React.ReactNode;
  externalLoading?: boolean;
}

export default function RouteLoader({ children, externalLoading = false }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    setInternalLoading(true);
    const timer = setTimeout(() => setInternalLoading(false), 150);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const showOverlay = internalLoading || externalLoading;

  return <LoadingOverlay isLoading={showOverlay}>{children}</LoadingOverlay>;
}