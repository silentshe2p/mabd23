import { useState, useEffect, useRef } from 'react';

export const useLocalStorage = (key, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
      else {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      console.log(`Failed to get local storage value: ${err.message}`);
      return defaultValue;
    }
  });

  const setValue = (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.log(`Failed to set local storage value: ${err.message}`);
    }
    setStoredValue(value);
  };

  const removeKey = () => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.log(`Failed to remove from local storage: ${err.message}`);
    }
    setStoredValue(null);
  }

  return [storedValue, setValue, removeKey];
};

export const useTimeout = (callback, delay) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    // update callback if it changes
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => callbackRef.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};
