import { create } from 'zustand'

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'offline'

interface ConnectionState {
  status: ConnectionStatus
  reconnectAttempt: number
  maxAttempts: number
  lastConnectedAt: Date | null
  isOnline: boolean
  
  setStatus: (status: ConnectionStatus) => void
  setReconnectAttempt: (attempt: number) => void
  setConnected: () => void
  setDisconnected: () => void
  setReconnecting: (attempt: number) => void
  setFailed: () => void
  setOffline: (offline: boolean) => void
  reset: () => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'disconnected',
  reconnectAttempt: 0,
  maxAttempts: 5,
  lastConnectedAt: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  setStatus: (status) => set({ status }),
  
  setReconnectAttempt: (attempt) => set({ reconnectAttempt: attempt }),
  
  setConnected: () => set({ 
    status: 'connected', 
    reconnectAttempt: 0,
    lastConnectedAt: new Date()
  }),
  
  setDisconnected: () => set({ status: 'disconnected' }),
  
  setReconnecting: (attempt) => set({ 
    status: 'reconnecting', 
    reconnectAttempt: attempt 
  }),
  
  setFailed: () => set({ status: 'failed' }),
  
  setOffline: (offline) => set({ 
    isOnline: !offline,
    status: offline ? 'offline' : 'disconnected'
  }),
  
  reset: () => set({
    status: 'disconnected',
    reconnectAttempt: 0,
    lastConnectedAt: null
  })
}))
