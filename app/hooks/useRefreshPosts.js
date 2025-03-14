"use client";
import { useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNotification } from "@/app/providers/NotificationProvider";

export function useRefreshPosts() {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!token || refreshing) return;

    setRefreshing(true);
    try {
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showNotification("Failed to refresh posts", "error");
    } finally {
      setRefreshing(false);
    }
  }, [token, refreshing, showNotification]);

  return {
    refreshTrigger,
    refreshing,
    refresh,
  };
}
