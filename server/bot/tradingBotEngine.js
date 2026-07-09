import { addLog, db, rowToStatus } from '../db/database.js'
import { env } from '../config/env.js'
import { TossClient } from './tossClient.js'

function validateOrderInput({ symbol, quantity = '1', price, orderType = 'MARKET' }) {
  if (!/^[A-Za-z0-9.-]+$/.test(String(symbol || ''))) {
    throw new Error('주문 차단: 유효한 종목 코드가 필요합니다.')
  }

  if (!/^\d+(\.\d+)?$/.test(String(quantity))) {
    throw new Error('주문 차단: 유효한 주문 수량이 필요합니다.')
  }

  if (!['MARKET', 'LIMIT'].includes(orderType)) {
    throw new Error('주문 차단: orderType은 MARKET 또는 LIMIT만 가능합니다.')
  }

  if (orderType === 'LIMIT' && !/^\d+(\.\d+)?$/.test(String(price || ''))) {
    throw new Error('주문 차단: 지정가 주문에는 유효한 가격이 필요합니다.')
  }
}

function toMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number)
  return hours * 60 + minutes
}

function currentSeoulMinutes() {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0)
  return hour * 60 + minute
}

export class TradingBotEngine {
  constructor() {
    this.client = new TossClient({
      live: env.tradingMode === 'live',
      liveOrderEnabled: env.liveOrderEnabled,
      clientId: env.tossClientId,
      clientSecret: env.tossClientSecret,
      apiBaseUrl: env.tossApiBaseUrl,
      accountSeq: env.tossAccountSeq,
    })
  }

  getStatus() {
    return rowToStatus(db.prepare('SELECT * FROM bot_status WHERE id = 1').get())
  }

  start() {
    db.prepare("UPDATE bot_status SET isRunning = 1, phase = 'scanning' WHERE id = 1").run()
    addLog('봇 ON: 후보 종목 스캔을 시작했습니다')
    this.refreshCandidates()
    return this.getStatus()
  }

  stop() {
    db.prepare("UPDATE bot_status SET isRunning = 0, phase = 'waiting' WHERE id = 1").run()
    addLog('봇 OFF: 자동매매를 중지했습니다')
    return this.getStatus()
  }

  refreshCandidates() {
    const rows = db.prepare('SELECT * FROM candidates ORDER BY score DESC').all()
    const update = db.prepare(`
      UPDATE candidates
      SET price = ?, changeRate = ?, volume = ?, tradingValue = ?, score = ?
      WHERE symbol = ?
    `)

    rows.forEach((row, index) => {
      const drift = index % 2 === 0 ? 0.15 : -0.08
      const changeRate = Number((row.changeRate + drift).toFixed(2))
      const price = Math.max(1000, Math.round(row.price * (1 + drift / 100)))
      const volume = row.volume + 10000 * (index + 1)
      const tradingValue = price * volume
      const score = Math.min(99, Math.max(1, row.score + (index === 0 ? 1 : 0)))
      update.run(price, changeRate, volume, tradingValue, score, row.symbol)
    })
  }

  async tick(nowMinutes = currentSeoulMinutes()) {
    const status = this.getStatus()
    const strategy = db.prepare('SELECT * FROM strategy WHERE id = 1').get()
    const scanStart = toMinutes(strategy.scanStart)
    const scanEnd = toMinutes(strategy.scanEnd)
    const forceSell = toMinutes(strategy.forceSellTime)

    if (!status.isRunning) {
      return { action: 'idle', status, reason: 'bot-off' }
    }

    if (nowMinutes >= scanStart && nowMinutes < scanEnd && status.phase === 'waiting') {
      const next = this.start()
      return { action: 'scan-started', status: next }
    }

    if (nowMinutes >= scanEnd && nowMinutes < forceSell && status.phase === 'scanning') {
      const top = db.prepare('SELECT * FROM candidates ORDER BY score DESC, tradingValue DESC LIMIT 1').get()
      const result = await this.buy({ symbol: top.symbol, quantity: '1', orderType: 'MARKET' })
      db.prepare("UPDATE bot_status SET phase = 'watching', currentSymbol = ? WHERE id = 1").run(top.symbol)
      addLog(`자동 매수 흐름 실행: ${top.name}`)
      return { action: 'auto-buy-requested', symbol: top.symbol, result, status: this.getStatus() }
    }

    if (nowMinutes >= forceSell && status.currentSymbol) {
      const result = await this.emergencySell()
      return { action: 'force-sell-requested', result, status: this.getStatus() }
    }

    if (status.phase === 'scanning') {
      this.refreshCandidates()
      return { action: 'scan-refreshed', status: this.getStatus() }
    }

    return { action: 'no-op', status: this.getStatus() }
  }

  async getAccounts() {
    return this.client.getAccounts()
  }

  async buy({ symbol, quantity, price, orderType }) {
    validateOrderInput({ symbol, quantity, price, orderType })
    const strategy = db.prepare('SELECT * FROM strategy WHERE id = 1').get()
    if (strategy.budget > 100000) {
      throw new Error('안전 차단: 전략 투자금이 100,000원을 초과합니다.')
    }

    const result = await this.client.placeBuyOrder({ symbol, quantity, price, orderType, budget: strategy.budget })
    db.prepare("UPDATE bot_status SET phase = 'bought', currentSymbol = ? WHERE id = 1").run(symbol)
    addLog(`실전 매수 주문 요청: ${symbol}`)
    return result
  }

  async sell({ symbol, quantity, price, orderType, reason = 'manual' }) {
    validateOrderInput({ symbol, quantity, price, orderType })
    const result = await this.client.placeSellOrder({ symbol, quantity, price, orderType, reason })
    db.prepare("UPDATE bot_status SET phase = 'closed', currentSymbol = NULL WHERE id = 1").run()
    addLog(`실전 매도 주문 요청: ${symbol}`)
    return result
  }

  async emergencySell() {
    const status = this.getStatus()
    if (!status.currentSymbol) {
      addLog('긴급 매도 요청: 보유 종목이 없어 실행하지 않았습니다')
      return { ok: true, message: '현재 보유 종목이 없습니다.' }
    }

    await this.client.placeSellOrder({ symbol: status.currentSymbol, reason: 'manual-emergency' })
    db.prepare("UPDATE bot_status SET currentSymbol = NULL, phase = 'closed' WHERE id = 1").run()
    addLog(`긴급 매도 실행: ${status.currentSymbol}`)
    return { ok: true, message: `${status.currentSymbol} 긴급 매도 요청을 처리했습니다.` }
  }
}
