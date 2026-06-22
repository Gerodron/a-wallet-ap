'use client';

/**
 * @file UI Zustand store.
 *
 * Manages ephemeral UI state: sidebar visibility, toast notification queue,
 * and the currently open modal. Nothing here is persisted — it resets on
 * every page load.
 */

import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  /** Unique identifier (generated on creation). */
  id: string;
  /** Variant — drives icon & colour in the toast component. */
  type: NotificationType;
  /** Headline. */
  title: string;
  /** Optional longer description. */
  message?: string;
  /** Auto-dismiss delay in ms (default: 5 000). */
  duration?: number;
}

export type ModalType =
  | 'send'
  | 'receive'
  | 'confirm-transaction'
  | 'settings'
  | 'network-select'
  | null;

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface UIState {
  /** Whether the sidebar / navigation drawer is open. */
  isSidebarOpen: boolean;
  /** FIFO queue of toast notifications. */
  notifications: Notification[];
  /** Currently visible modal (null = none). */
  currentModal: ModalType;

  // — Actions —
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setModal: (modal: ModalType) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _notifCounter = 0;
/** Generate a monotonically-increasing notification ID. */
const nextId = () => `notif-${++_notifCounter}-${Date.now()}`;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectIsSidebarOpen = (s: UIState) => s.isSidebarOpen;
export const selectNotifications = (s: UIState) => s.notifications;
export const selectCurrentModal = (s: UIState) => s.currentModal;
