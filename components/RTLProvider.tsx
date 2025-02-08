import React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtl from 'stylis-plugin-rtl';
import { ReactNode } from 'react';

interface RTLProviderProps {
  children: ReactNode;
}

const RTLProvider = ({ children }: RTLProviderProps) => {
  const cache = createCache({
    key: 'samma-rtl',
    stylisPlugins: [rtl],
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export default RTLProvider; 