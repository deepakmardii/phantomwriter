"use client";
import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    (message, type = "success", duration = 5000) => {
      setNotification({ message, type });
      setTimeout(() => {
        setNotification(null);
      }, duration);
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-lg p-4 flex items-center shadow-lg ${
              notification.type === "success"
                ? "bg-green-600"
                : notification.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            <p className="text-white">{notification.message}</p>
            <button
              onClick={hideNotification}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
