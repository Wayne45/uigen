export const panelStorage = {
  getItem(name: string): string | null {
    console.log('[panelStorage.getItem] Called with name:', name);
    console.log('[panelStorage.getItem] typeof window:', typeof window);
    console.log('[panelStorage.getItem] window.localStorage exists:', typeof window !== 'undefined' && !!window.localStorage);
    console.log('[panelStorage.getItem] localStorage.getItem type:', typeof window !== 'undefined' && window.localStorage ? typeof window.localStorage.getItem : 'N/A');

    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      try {
        const result = window.localStorage.getItem(name);
        console.log('[panelStorage.getItem] Success, result:', result);
        return result;
      } catch (error) {
        console.error('[panelStorage.getItem] Error:', error);
        return null;
      }
    }
    console.log('[panelStorage.getItem] Returning null (conditions not met)');
    return null;
  },
  setItem(name: string, value: string): void {
    console.log('[panelStorage.setItem] Called with name:', name, 'value:', value);
    console.log('[panelStorage.setItem] typeof window:', typeof window);
    console.log('[panelStorage.setItem] window.localStorage exists:', typeof window !== 'undefined' && !!window.localStorage);
    console.log('[panelStorage.setItem] localStorage.setItem type:', typeof window !== 'undefined' && window.localStorage ? typeof window.localStorage.setItem : 'N/A');

    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      try {
        window.localStorage.setItem(name, value);
        console.log('[panelStorage.setItem] Success');
      } catch (error) {
        console.error('[panelStorage.setItem] Error:', error);
      }
    } else {
      console.log('[panelStorage.setItem] Skipped (conditions not met)');
    }
  },
};
