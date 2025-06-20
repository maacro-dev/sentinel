import { useState, useCallback } from "react";

type SetValue<T> = (value: T | ((val: T) => T)) => void;

/**
 * A custom hook that persists state to localStorage.
 *
 * @template T - The type of the stored value
 * @param {string} key - The key under which to store the value in localStorage
 * @param {T} initialValue - The initial value to use if no value exists in localStorage
 * @returns {[T, SetValue<T>]} A stateful value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const valueToStore =
          typeof value === "function" ? (value as (v: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
          console.warn(`Setting localStorage failed for ${key}`, e);
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
