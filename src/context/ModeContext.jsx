import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { usersApi } from '../api/users.js';

const ModeContext = createContext(null);

/**
 * Interface-only preference (client vs worker). This NEVER controls backend
 * authorization by itself - the server always checks actual relationships
 * (task ownership, order participation) regardless of currentMode.
 *
 * FIX: mode is now DERIVED from the signed-in user instead of being copied
 * into separate state. Before, the first render always used 'client' and
 * only switched after an effect ran, so the homepage fetched the wrong
 * mode's data first and could flash the wrong section. It also swallowed
 * save failures, so a failed /users/mode call made the mode "snap back"
 * after a reload with no explanation. Now a failed save reverts the UI.
 */
export function ModeProvider({ children }) {
  const { user, updateLocalUser } = useAuth();
  const mode = user?.currentMode === 'worker' ? 'worker' : 'client';

  const setMode = useCallback(
    async (newMode) => {
      if (newMode !== 'client' && newMode !== 'worker') return;
      if (newMode === mode) return;

      const previous = mode;
      updateLocalUser({ currentMode: newMode }); // optimistic
      try {
        await usersApi.switchMode(newMode);
      } catch {
        updateLocalUser({ currentMode: previous }); // keep UI in sync with the server
      }
    },
    [mode, updateLocalUser]
  );

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
