'use client';
import { AuthProvider } from './AuthProvider';
import { NotificationProvider } from './NotificationProvider';
import ErrorBoundary from '../components/ErrorBoundary';
import { SessionProvider } from 'next-auth/react';
import ScheduledPostsHandler from '../components/ScheduledPostsHandler';

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <NotificationProvider>
          <AuthProvider>
            {children}
            <ScheduledPostsHandler />
          </AuthProvider>
        </NotificationProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
