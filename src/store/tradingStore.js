import { create } from 'zustand'

async function request(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`)
  }

  return response.json()
}

export const useTradingStore = create((set, get) => ({
  status: null,
  strategy: null,
  config: null,
  candidates: [],
  trades: [],
  logs: [],
  loading: false,
  error: '',

  refresh: async () => {
    set({ loading: true, error: '' })
    try {
      const [status, strategy, config, candidates, trades, logs] = await Promise.all([
        request('/api/bot/status'),
        request('/api/strategy'),
        request('/api/bot/config'),
        request('/api/candidates'),
        request('/api/trades'),
        request('/api/logs'),
      ])
      set({ status, strategy, config, candidates, trades, logs, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  startBot: async () => {
    const status = await request('/api/bot/start', { method: 'POST' })
    set({ status })
    await get().refresh()
  },

  stopBot: async () => {
    const status = await request('/api/bot/stop', { method: 'POST' })
    set({ status })
    await get().refresh()
  },

  updateStrategy: async (strategy) => {
    const saved = await request('/api/strategy', {
      method: 'PUT',
      body: JSON.stringify(strategy),
    })
    set({ strategy: saved })
    await get().refresh()
  },

  emergencySell: async () => {
    const result = await request('/api/order/emergency-sell', {
      method: 'POST',
      body: JSON.stringify({ confirmLiveOrder: true }),
    })
    await get().refresh()
    return result
  },
}))
