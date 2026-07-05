'use client';

/**
 * @file Estado de la interfaz de usuario.
 */

import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

export type ModalType =
  | 'send'
  | 'receive'
  | 'confirm-transaction'
  | 'settings'
  | 'network-select'
  | null;

interface UIState {
  isSidebarOpen: boolean;
  notifications: Notification[];
  currentModal: ModalType;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setModal: (modal: ModalType) => void;
}

let _notifCounter = 0;
const nextId = () => `notif-${++_notifCounter}-${Date.now()}`;

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: false,
  notifications: [],
  currentModal: null,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  addNotification: (n) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...n, id: nextId(), duration: n.duration ?? 5_000 },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  setModal: (modal) => set({ currentModal: modal }),
}));

export const selectIsSidebarOpen = (s: UIState) => s.isSidebarOpen;
export const selectNotifications = (s: UIState) => s.notifications;
export const selectCurrentModal = (s: UIState) => s.currentModal;
