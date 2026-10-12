const keys = new Map<string, string>()
const listeners = new Set<() => void>()
let revision = 0

function notify(): void {
  revision++
  for (const listener of listeners)
    listener()
}

/** @description 本窗口 API key 与凭据更新订阅 */
export const credentials = {
  get(id: string): string | undefined {
    return keys.get(id)
  },

  set(id: string, key: string): void {
    keys.set(id, key)
    notify()
  },

  remove(id: string): void {
    keys.delete(id)
    notify()
  },

  clear(): void {
    keys.clear()
    notify()
  },

  sync(configs: readonly { id: string, persistKey: boolean }[]): void {
    const retained = new Set(configs.filter(config => !config.persistKey).map(config => config.id))
    for (const id of keys.keys()) {
      if (!retained.has(id))
        keys.delete(id)
    }
    notify()
  },

  getSnapshot(): number {
    return revision
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
