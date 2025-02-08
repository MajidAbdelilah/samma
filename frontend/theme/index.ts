import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  direction: 'rtl',
  fonts: {
    heading: 'var(--font-cairo)',
    body: 'var(--font-cairo)',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  },
  // Custom color scheme for Arabic UI
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
    }
  }
}); 