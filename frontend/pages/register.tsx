import * as React from 'react';
import { useRouter } from 'next/router';
import api from '../lib/axios';
import { useAuth } from '../lib/auth';
import Link from 'next/link';
import { UserPlusIcon } from '@heroicons/react/24/solid';
// import { Button, Input } from '@shadcn/ui'; // Uncomment if shadcn/ui is set up

export default function Register() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = React.useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    state: '',
    country: ''
  });
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', form);
      await login(form.email, form.password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shopify-bg to-shopify-light-blue">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border border-shopify-pale-blue flex flex-col items-center bg-shopify-bg relative overflow-hidden">
        <div className="relative z-10 mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-shopify-light-blue to-shopify-blue flex items-center justify-center mb-2 shadow-lg border-2 border-shopify-blue">
            <UserPlusIcon className="h-10 w-10 text-shopify-blue" />
          </div>
          <h1 className="text-3xl font-extrabold text-shopify-blue mb-1 drop-shadow">Register</h1>
          <p className="text-shopify-gray-blue text-sm">Create your <span className="font-bold text-shopify-blue">FireNewsDashboard</span> account</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-shopify-blue">First Name</label>
              <input
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
                required
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-shopify-blue">Last Name</label>
              <input
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
                required
                placeholder="Last Name"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-shopify-blue">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
              required
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-shopify-blue">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
              required
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-shopify-blue">Phone</label>
              <input
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
                required
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-shopify-blue">City</label>
              <input
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
                required
                placeholder="City"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-shopify-blue">State</label>
              <input
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
                required
                placeholder="State"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-shopify-blue">Country</label>
              <input
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-shopify-pale-blue rounded-lg text-shopify-blue placeholder-shopify-gray-blue focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition shadow-inner"
                required
                placeholder="Country"
              />
            </div>
          </div>
          {error && <div className="text-red-400 text-sm text-center font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full bg-shopify-blue hover:bg-shopify-light-blue text-white font-bold p-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-shopify-light-blue transition border border-shopify-blue mt-2 text-lg"
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-shopify-gray-blue relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="text-shopify-blue hover:underline font-medium">Login</Link>
        </div>
      </div>
    </div>
  );
} 