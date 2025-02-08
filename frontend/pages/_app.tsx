import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Head from 'next/head';
import { AuthProvider } from '../components/Auth/AuthProvider';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  direction: 'rtl', // Enable RTL support
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>سماء - متجر الألعاب الرقمية العربي</title>
        <meta name="description" content="متجر الألعاب الرقمية العربي الأول" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp; 