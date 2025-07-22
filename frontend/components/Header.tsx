import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="w-full bg-white shadow-sm py-4 px-8 flex items-center justify-between">
      <Link href="/">
        <span className="text-xl font-bold text-blue-700">FireNewsDashboard</span>
      </Link>
      <nav className="flex gap-4 items-center">
        {user ? (
          <>
            <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
            <span className="text-gray-600">{user.email}</span>
          </>
        ) : (
          <>
            <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
} 