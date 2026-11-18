import { useEffect, useState } from "react";

// State biasa seperti useState, tapi nilainya juga disimpan di localStorage
// supaya data tidak hilang saat halaman di-refresh.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // abaikan kalau localStorage tidak tersedia / penuh
    }
  }, [key, value]);

  return [value, setValue];
}
