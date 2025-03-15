'use client';
import { createContext, useContext } from 'react';
import { useSession, signOut } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();

  const logout = () => signOut({ callbackUrl: '/' });

  const value = {
    user: session?.user || null,
    token: session?.accessToken || null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
