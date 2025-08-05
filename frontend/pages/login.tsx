import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page instead of showing login form
    router.replace('/');
  }, [router]);

  return null; // Don't render anything while redirecting
} 