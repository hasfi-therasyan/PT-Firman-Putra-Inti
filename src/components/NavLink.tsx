'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from './NavigationContext';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  // spread other anchor props
  [key: string]: any;
}

export default function NavLink({ href, children, className = '', onClick, ...rest }: NavLinkProps) {
  const router = useRouter();
  const { setIsLoading } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If user wants default behavior (e.g., cmd+click), let browser handle
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    setIsLoading(true);
    router.push(href);
    // keep loading for a short minimum to avoid flash
    setTimeout(() => setIsLoading(false), 200);
    if (onClick) onClick(e);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
}