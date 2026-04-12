import { Coordinates } from 'shared-types'

const DB_NAME = 'syncride_offline_buffer'
const DB_VERSION = 1
const STORE_NAME = 'location_updates'
const MAX_BUFFER_SIZE = 1000

export interface BufferedLocation {
  id?: number
  riderId: string
  coordinates: Coordinates
  timestamp: Date
  heading?: number
  speed?: number
}

let dbInstance: IDBDatabase | null = null

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('❌ Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        store.createIndex('riderId', 'riderId', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

export async function bufferLocation(location: BufferedLocation): Promise<void> {
  try {
    const db = await openDB()
    
    // Check buffer size first
    const count = await getBufferCount()
    if (count >= MAX_BUFFER_SIZE) {
      console.warn('⚠️ Offline buffer full, dropping oldest location data')
      await deleteOldestLocations(100) // Delete oldest 100 to make room
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.add({
        ...location,
        timestamp: location.timestamp instanceof Date ? location.timestamp : new Date(location.timestamp)
      })

      request.onsuccess = () => {
        console.log('📦 Location buffered offline')
        resolve()
      }
      
      request.onerror = () => {
        console.error('❌ Failed to buffer location:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('❌ IndexedDB error:', error)
    throw error
  }
}

export async function getBufferCount(): Promise<number> {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.count()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getBufferedLocations(riderId?: string): Promise<BufferedLocation[]> {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    let request: IDBRequest
    
    if (riderId) {
      const index = store.index('riderId')
      request = index.getAll(riderId)
    } else {
      request = store.getAll()
    }

    request.onsuccess = () => {
      const locations = request.result.map((loc: BufferedLocation) => ({
        ...loc,
        timestamp: new Date(loc.timestamp)
      }))
      resolve(locations)
    }
    
    request.onerror = () => reject(request.error)
  })
}

export async function clearBuffer(riderId?: string): Promise<void> {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    if (riderId) {
      const index = store.index('riderId')
      const request = index.openCursor(IDBKeyRange.only(riderId))
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      
      transaction.oncomplete = () => {
        console.log(`🗑️ Cleared buffer for rider ${riderId}`)
        resolve()
      }
    } else {
      const request = store.clear()
      request.onsuccess = () => {
        console.log('🗑️ Cleared entire offline buffer')
        resolve()
      }
      request.onerror = () => reject(request.error)
    }
  })
}

async function deleteOldestLocations(count: number): Promise<void> {
  const db = await openDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('timestamp')
    const request = index.openCursor()
    
    let deleted = 0
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor && deleted < count) {
        cursor.delete()
        deleted++
        cursor.continue()
      }
    }
    
    transaction.oncomplete = () => {
      console.log(`🗑️ Deleted ${deleted} oldest locations from buffer`)
      resolve()
    }
    
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function checkStorageAvailable(): Promise<boolean> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const availableBytes = (estimate.quota || 0) - (estimate.usage || 0)
      const availableMB = availableBytes / (1024 * 1024)
      
      if (availableMB < 10) {
        console.warn('⚠️ Low storage, location buffering may be disabled')
        return false
      }
      return true
    } catch {
      return true // Assume available if we can't check
    }
  }
  return true
}
