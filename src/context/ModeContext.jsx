import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { usersApi } from '../api/users.js';

const ModeContext = createContext(null);

/**
 * Interface-only preference (client vs worker). This NEVER controls backend
 * authorization by itself - the server always checks actual relationships
 * (task ownership, order participation) regardless of currentMode.
 */
export function ModeProvider({ children }) {
  const { user, updateLocalUser } = useAuth();
  const [mode, setModeState] = useState('client');

  useEffect(() => {
    if (user?.currentMode) setModeState(user.currentMode);
  }, [user?.currentMode]);

  const setMode = async (newMode) => {
    setModeState(newMode);
    updateLocalUser({ currentMode: newMode });
    try {
      await usersApi.switchMode(newMode);
    } catch {
      // Non-fatal: the UI already reflects the switch optimistically.
    }
  };

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
