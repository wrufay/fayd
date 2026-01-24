// Detect if running as Chrome extension
export const isExtension = (): boolean => {
  return typeof chrome !== 'undefined' &&
         typeof chrome.storage !== 'undefined' &&
         typeof chrome.storage.local !== 'undefined'
}

// Storage wrapper that works in both extension and web contexts
export const storage = {
  get: async (keys: string[]): Promise<Record<string, unknown>> => {
    if (isExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve)
      })
    }
    // Web fallback using localStorage
    const result: Record<string, unknown> = {}
    keys.forEach(key => {
      const value = localStorage.getItem(`fayd-${key}`)
      if (value) {
        try {
          result[key] = JSON.parse(value)
        } catch {
          result[key] = value
        }
      }
    })
    return result
  },

  set: async (data: Record<string, unknown>): Promise<void> => {
    if (isExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve)
      })
    }
    // Web fallback
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`fayd-${key}`, JSON.stringify(value))
    })
  },

  remove: async (key: string): Promise<void> => {
    if (isExtension()) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(key, resolve)
      })
    }
    localStorage.removeItem(`fayd-${key}`)
  }
}

// Send message to background script (no-op in web mode)
export const sendMessage = (message: unknown): void => {
  if (isExtension() && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(message)
  }
}
