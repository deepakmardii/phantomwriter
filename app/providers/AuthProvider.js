'use client';
import { createContext, useContext, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const logout = () => signOut({ callbackUrl: '/' });

  const updateUserData = useCallback(
    async newData => {
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          ...newData,
        },
      });

      // Force a router refresh to update all server components
      router.refresh();
    },
    [session, update, router]
  );

  const value = {
    user: session?.user || null,
    token: session?.token || session?.accessToken || null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout,
    updateUserData,
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
