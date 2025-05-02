
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type: "job_completed" | "job_assigned" | "invoice_due" | "system";
  priority: NotificationPriority;
  actionData?: any;
}

interface NotificationPreferences {
  completedJobs: boolean;
  assignedJobs: boolean;
  invoiceDue: boolean;
  systemUpdates: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    completedJobs: true,
    assignedJobs: true,
    invoiceDue: true,
    systemUpdates: true,
  });
  
  // Load saved preferences from localStorage
  useEffect(() => {
    if (user) {
      const savedPrefs = localStorage.getItem(`notification_prefs_${user.id}`);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      
      // Load saved notifications
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        try {
          const parsedNotifications = JSON.parse(savedNotifications).map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          }));
          setNotifications(parsedNotifications);
        } catch (e) {
          console.error("Error parsing saved notifications", e);
        }
      }
    }
  }, [user]);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);
  
  const updatePreferences = (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;
    
    const newPreferences = { ...preferences, ...prefs };
    setPreferences(newPreferences);
    localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(newPreferences));
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      preferences,
      updatePreferences,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
