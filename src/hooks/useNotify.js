import { useState, useCallback } from 'react';

export function useNotify() {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    // Disparition auto après 3 secondes
    setTimeout(() => setNotification(null), 3000);
  }, []);

  return { notification, notify };
}