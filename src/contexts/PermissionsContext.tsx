import React, { createContext, type ReactNode, useContext, useEffect,useState } from 'react';
import { type Hex } from 'viem';
import { type P256Credential } from 'webauthn-p256';

interface PermissionsContextType {
  permissionsContext: Hex | undefined;
  setPermissionsContext: React.Dispatch<React.SetStateAction<Hex | undefined>>;
  credential: P256Credential<'cryptokey'> | undefined;
  setCredential: React.Dispatch<React.SetStateAction<P256Credential<'cryptokey'> | undefined>>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissionsContext, setPermissionsContext] = useState<Hex | undefined>();
  const [credential, setCredential] = useState<P256Credential<'cryptokey'> | undefined>();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;
  
  return (
    <PermissionsContext.Provider value={{ permissionsContext, setPermissionsContext, credential, setCredential }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export default PermissionsProvider;

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}