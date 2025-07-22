import * as React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/solid';
// import { Button, Input } from '@shadcn/ui'; // Uncomment if shadcn/ui is set up

export default function Login() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError('Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shopify-bg to-shopify-light-blue">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border border-shopify-pale-blue flex flex-col items-center bg-shopify-bg relative overflow-hidden">
        <div className="relative z-10 mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-shopify-light-blue to-shopify-blue flex items-center justify-center mb-2 shadow-lg border-2 border-shopify-blue">
            <LockClosedIcon className="h-10 w-10 text-shopify-blue" />
          </div>
          <h1 className="text-3xl font-extrabold text-shopify-blue mb-1 drop-shadow">Sign in</h1>
          <p className="text-shopify-gray-blue text-sm">Welcome back to <span className="font-bold text-shopify-blue">FireNewsDashboard</span></p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 relative z-10">
          <div>
            <label className="block mb-1 text-sm font-medium text-shopify-blue">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
              required
              autoComplete="email"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-shopify-blue">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-400 text-sm text-center font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full bg-shopify-blue hover:bg-shopify-light-blue text-white font-bold p-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition border border-shopify-blue mt-2 text-lg"
            disabled={submitting}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-shopify-gray-blue relative z-10">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-shopify-blue hover:underline font-medium">Register</Link>
        </div>
      </div>
    </div>
  );
} 