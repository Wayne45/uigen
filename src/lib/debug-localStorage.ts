// Global localStorage interceptor for debugging

if (typeof global !== 'undefined') {
  console.log('[debug-localStorage] Setting up global localStorage interceptor on server');

  // Create a proxy to intercept any localStorage access
  const localStorageProxy = new Proxy({}, {
    get(target, prop) {
      const stack = new Error().stack;
      console.log(`[debug-localStorage] Server-side access to localStorage.${String(prop)}`);
      console.log('[debug-localStorage] Stack trace:', stack);

      // Return a safe mock
      if (prop === 'getItem' || prop === 'setItem' || prop === 'removeItem' || prop === 'clear') {
        return () => {
          console.log(`[debug-localStorage] Called localStorage.${String(prop)} on server (no-op)`);
          return null;
        };
      }
      return undefined;
    },
    set(target, prop, value) {
      console.log(`[debug-localStorage] Attempted to set localStorage.${String(prop)} =`, value);
      return true;
    }
  });

  // Override global.localStorage
  Object.defineProperty(global, 'localStorage', {
    get() {
      console.log('[debug-localStorage] global.localStorage accessed!');
      return localStorageProxy;
    },
    configurable: true
  });
}
