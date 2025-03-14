"use client";
import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "./NotificationProvider";
import ErrorBoundary from "../components/ErrorBoundary";

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
