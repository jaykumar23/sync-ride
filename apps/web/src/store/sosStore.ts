import { create } from 'zustand'
import { Coordinates } from 'shared-types'

interface SOSAlert {
  riderId: string
  displayName: string
  coordinates: Coordinates
  timestamp: string
}

interface SOSStore {
  activeAlerts: Record<string, SOSAlert>
  mySOSActive: boolean
  pendingAlert: SOSAlert | null
  addAlert: (alert: SOSAlert) => void
  removeAlert: (riderId: string) => void
  setMySOSActive: (active: boolean) => void
  setPendingAlert: (alert: SOSAlert | null) => void
  clearPendingAlert: () => void
}

export const useSOSStore = create<SOSStore>((set) => ({
  activeAlerts: {},
  mySOSActive: false,
  pendingAlert: null,
  
  addAlert: (alert) =>
    set((state) => ({
      activeAlerts: {
        ...state.activeAlerts,
        [alert.riderId]: alert
      },
      pendingAlert: state.pendingAlert?.riderId === alert.riderId ? state.pendingAlert : alert
    })),
  
  removeAlert: (riderId) =>
    set((state) => {
      const { [riderId]: removed, ...rest } = state.activeAlerts
      return { 
        activeAlerts: rest,
        pendingAlert: state.pendingAlert?.riderId === riderId ? null : state.pendingAlert
      }
    }),
  
  setMySOSActive: (active) =>
    set({ mySOSActive: active }),
  
  setPendingAlert: (alert) =>
    set({ pendingAlert: alert }),
  
  clearPendingAlert: () =>
    set({ pendingAlert: null })
}))
