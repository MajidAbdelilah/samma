declare module 'stylis-plugin-rtl' {
  const rtlPlugin: any;
  export default rtlPlugin;
}

declare module '@emotion/cache' {
  interface CacheOptions {
    key: string;
    stylisPlugins?: any[];
    [key: string]: any;
  }
  
  function createCache(options: CacheOptions): any;
  export default createCache;
} 