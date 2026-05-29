import { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('sessionId');
    return saved ? Number(saved) : null;
  });
  const [sessionName, setSessionName] = useState(() => {
    return localStorage.getItem('sessionName') || '';
  });

  const selectSession = (id, name) => {
    setSessionId(id);
    setSessionName(name);
    localStorage.setItem('sessionId', id);
    localStorage.setItem('sessionName', name);
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionName('');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionName');
  };

  return (
    <SessionContext.Provider value={{ sessionId, sessionName, selectSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}