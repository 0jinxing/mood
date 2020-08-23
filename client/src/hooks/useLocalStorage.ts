import { useState, useCallback } from 'react';

const useLocalStorage = (key: string, initialValue: string = '') => {
  const [state, setState] = useState<string>(() => {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
    
    localStorage.setItem(key, initialValue);
    return initialValue;
  });

  const setItem = useCallback(
    val => {
      localStorage.setItem(key, val);
      setState(val);
    },
    [key, setState]
  );

  const removeItem = useCallback(() => {
    localStorage.removeItem(key);
    setState('');
  }, [key, setState]);

  return [state, setItem, removeItem];
};

export default useLocalStorage;
