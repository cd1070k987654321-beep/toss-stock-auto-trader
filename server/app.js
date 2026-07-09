import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TradingBotEngine } from './bot/tradingBotEngine.js'
import { env, getTossCredentialStatus } from './config/env.js'
import { addLog, db, initDb, rowToStatus } from './db/database.js'

initDb()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')
const app = express()
const bot = new TradingBotEngine()

app.use(cors())
app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/bot/status', (_request, response) => {
  response.json(bot.getStatus())
})

app.get('/api/bot/config', (_request, response) => {
  response.json(getTossCredentialStatus())
})

app.get('/api/toss/accounts', async (_request, response) => {
  try {
    response.json(await bot.getAccounts())
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

app.post('/api/bot/start', (_request, response) => {
  response.json(bot.start())
})

app.post('/api/bot/stop', (_request, response) => {
  response.json(bot.stop())
})

app.post('/api/bot/tick', async (_request, response) => {
  try {
    response.json(await bot.tick())
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

app.get('/api/strategy', (_request, response) => {
  response.json(db.prepare('SELECT * FROM strategy WHERE id = 1').get())
})

app.put('/api/strategy', (request, response) => {
  const next = {
    budget: Number(request.body.budget),
    scanStart: request.body.scanStart,
    scanEnd: request.body.scanEnd,
    takeProfit: Number(request.body.takeProfit),
    stopLoss: Number(request.body.stopLoss),
    forceSellTime: request.body.forceSellTime,
    maxTradesPerDay: Number(request.body.maxTradesPerDay),
  }

  if (next.budget > 100000) {
    return response.status(400).json({ message: '안전 설정상 100,000원 초과 주문은 차단됩니다.' })
  }

  db.prepare(`
    UPDATE strategy
    SET budget = @budget,
        scanStart = @scanStart,
        scanEnd = @scanEnd,
        takeProfit = @takeProfit,
        stopLoss = @stopLoss,
        forceSellTime = @forceSellTime,
        maxTradesPerDay = @maxTradesPerDay
    WHERE id = 1
  `).run(next)

  addLog('전략 설정이 저장되었습니다')
  response.json(db.prepare('SELECT * FROM strategy WHERE id = 1').get())
})

app.get('/api/candidates', (_request, response) => {
  response.json(db.prepare('SELECT * FROM candidates ORDER BY score DESC, tradingValue DESC').all())
})

app.get('/api/trades', (_request, response) => {
  response.json(db.prepare('SELECT * FROM trades ORDER BY id DESC').all())
})

app.get('/api/logs', (_request, response) => {
  response.json(db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT 30').all())
})

app.post('/api/order/buy', async (request, response) => {
  try {
    if (env.tradingMode === 'live' && request.body.confirmLiveOrder !== true) {
      return response.status(400).json({ message: '실전 주문 확인값이 필요합니다.' })
    }
    const { symbol, quantity = '1', price, orderType = 'MARKET' } = request.body
    response.json(await bot.buy({ symbol, quantity, price, orderType }))
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

app.post('/api/order/sell', async (request, response) => {
  try {
    if (env.tradingMode === 'live' && request.body.confirmLiveOrder !== true) {
      return response.status(400).json({ message: '실전 주문 확인값이 필요합니다.' })
    }
    const { symbol, quantity = '1', price, orderType = 'MARKET', reason = 'manual' } = request.body
    response.json(await bot.sell({ symbol, quantity, price, orderType, reason }))
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

app.post('/api/order/emergency-sell', async (request, response) => {
  try {
    if (env.tradingMode === 'live' && request.body.confirmLiveOrder !== true) {
      return response.status(400).json({ message: '실전 긴급 매도 확인값이 필요합니다.' })
    }
    response.json(await bot.emergencySell())
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

app.post('/api/dev/mock-buy', (_request, response) => {
  const top = db.prepare('SELECT * FROM candidates ORDER BY score DESC LIMIT 1').get()
  db.prepare(`
    UPDATE bot_status
    SET phase = 'watching',
        currentSymbol = ?,
        todayProfit = 1850,
        todayProfitRate = 1.85
    WHERE id = 1
  `).run(top.symbol)
  addLog(`테스트 매수 체결: ${top.name}`)
  response.json(rowToStatus(db.prepare('SELECT * FROM bot_status WHERE id = 1').get()))
})

app.use(express.static(distPath, {
  setHeaders(response, filePath) {
    if (filePath.endsWith('sw.js')) {
      response.setHeader('Cache-Control', 'no-cache')
    }
  },
}))

app.get(/^(?!\/api).*/, (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'))
})

export default app
