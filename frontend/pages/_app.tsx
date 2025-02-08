import React from 'react';
import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../theme/index';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import RTLProvider from '../components/RTLProvider';
import { AuthProvider } from '../hooks/useAuth';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <RTLProvider>
          <PayPalScriptProvider options={{ 
            'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
            currency: 'USD'
          }}>
            <Component {...pageProps} />
          </PayPalScriptProvider>
        </RTLProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp; 