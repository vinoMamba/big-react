
let syncQueue: ((...args: any) => void)[] | null = null
let isFlushingSyncQueue = false



export function scheduleSyncCallback(callback: (...args: any) => void) {
  if (syncQueue === null) {
    syncQueue = [callback]
  } else {
    syncQueue.push(callback)
  }
  console.log('scheduleSyncCallback', syncQueue)
}


export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true
    try {
      syncQueue.forEach(callback => callback())
    } catch (error) {
      console.error('flushSyncCallbacks 执行错误', error)
    } finally {
      isFlushingSyncQueue = false
      syncQueue = null
    }
  }
}
