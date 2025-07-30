import * as React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../lib/auth';
import { ThemeProvider } from '../lib/theme';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp; 