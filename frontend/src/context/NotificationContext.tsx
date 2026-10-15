import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface Notification {
  id: string;
  tipo: 'reserva' | 'clase' | 'pago' | 'sistema';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  sendReminder: (reservaId: number) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  const sendReminder = useCallback(async (reservaId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiFetch.post(`/api/notificaciones/reserva/${reservaId}/recordatorio`, {});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar recordatorio';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, leida: true } : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, leida: true }))
    );
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch.get<Notification[]>('/api/notificaciones');
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener notificaciones';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        sendReminder,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        clearError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;