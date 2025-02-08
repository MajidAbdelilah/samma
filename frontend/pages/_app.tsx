import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../components/Auth/AuthProvider';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { theme } from '../theme';
import Head from 'next/head';

const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
  intent: 'capture',
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>سماء - متجر الألعاب الرقمية العربي</title>
        <meta name="description" content="متجر الألعاب الرقمية العربي الأول" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <meta name="theme-color" content="#2B6CB0" />
      </Head>
      <PayPalScriptProvider options={initialPayPalOptions}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </PayPalScriptProvider>
    </ChakraProvider>
  );
}

export default MyApp; 