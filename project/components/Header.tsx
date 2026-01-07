'use client';

import { User } from '@/types';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  const [sticky, setSticky] = useState(false);

  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleStickyNavbar);
    return () => {
      window.removeEventListener('scroll', handleStickyNavbar);
    };
  }, []);

  return (
    <header
      className={`left-0 top-0 z-40 flex w-full items-center transition-all duration-300 ${
        sticky
          ? 'fixed bg-white/95 backdrop-blur-md shadow-md'
          : 'absolute bg-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                LegalCore
              </h1>
              <p className="text-xs text-gray-500">Enterprise Legal Operations</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/modules/entity-management"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Entities
            </Link>
            <Link
              href="/modules/legal-billing"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Billing
            </Link>
            <Link
              href="/modules/contracts"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contracts
            </Link>
          </nav>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
