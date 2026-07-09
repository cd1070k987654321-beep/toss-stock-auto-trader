import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.SQLITE_PATH
  || (process.env.VERCEL ? '/tmp/trading.sqlite' : path.resolve(__dirname, '../../data/trading.sqlite'))
export const db = new Database(dbPath)

const defaultStrategy = {
  budget: 100000,
  scanStart: '09:00',
  scanEnd: '09:10',
  takeProfit: 3,
  stopLoss: -2,
  forceSellTime: '14:50',
  maxTradesPerDay: 1,
}

const seedCandidates = [
  ['005930', '삼성전자', 81200, 1.24, 12340000, 1002000000000, 92, '거래대금 급증 + 양봉 전환'],
  ['035720', '카카오', 61200, 2.1, 2450000, 149940000000, 88, '전일 고점 돌파 + 거래량 증가'],
  ['000660', 'SK하이닉스', 231500, 0.86, 1850000, 428275000000, 84, '기관 순매수 + 변동성 안정'],
  ['373220', 'LG에너지솔루션', 402000, -0.32, 460000, 184920000000, 74, '낙폭 축소 + 수급 회복'],
  ['247540', '에코프로비엠', 188700, 3.42, 980000, 184926000000, 90, '상승률/거래대금 동시 강세'],
]

function now() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bot_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      isRunning INTEGER NOT NULL,
      mode TEXT NOT NULL,
      phase TEXT NOT NULL,
      currentSymbol TEXT,
      todayProfit INTEGER NOT NULL,
      todayProfitRate REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS strategy (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      budget INTEGER NOT NULL,
      scanStart TEXT NOT NULL,
      scanEnd TEXT NOT NULL,
      takeProfit REAL NOT NULL,
      stopLoss REAL NOT NULL,
      forceSellTime TEXT NOT NULL,
      maxTradesPerDay INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS candidates (
      symbol TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      changeRate REAL NOT NULL,
      volume INTEGER NOT NULL,
      tradingValue INTEGER NOT NULL,
      score INTEGER NOT NULL,
      reason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      buyTime TEXT NOT NULL,
      buyPrice INTEGER NOT NULL,
      sellTime TEXT,
      sellPrice INTEGER,
      quantity INTEGER NOT NULL,
      profit INTEGER NOT NULL,
      profitRate REAL NOT NULL,
      sellReason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      createdAt TEXT NOT NULL,
      message TEXT NOT NULL
    );
  `)

  db.prepare(`
    INSERT OR IGNORE INTO bot_status
    (id, isRunning, mode, phase, currentSymbol, todayProfit, todayProfitRate)
    VALUES (1, 0, 'test', 'waiting', NULL, 0, 0)
  `).run()

  db.prepare(`
    INSERT OR IGNORE INTO strategy
    (id, budget, scanStart, scanEnd, takeProfit, stopLoss, forceSellTime, maxTradesPerDay)
    VALUES (1, @budget, @scanStart, @scanEnd, @takeProfit, @stopLoss, @forceSellTime, @maxTradesPerDay)
  `).run(defaultStrategy)

  const candidateCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count
  if (candidateCount === 0) {
    const insert = db.prepare(`
      INSERT INTO candidates
      (symbol, name, price, changeRate, volume, tradingValue, score, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    seedCandidates.forEach((candidate) => insert.run(candidate))
  }

  const tradeCount = db.prepare('SELECT COUNT(*) as count FROM trades').get().count
  if (tradeCount === 0) {
    db.prepare(`
      INSERT INTO trades
      (symbol, name, buyTime, buyPrice, sellTime, sellPrice, quantity, profit, profitRate, sellReason)
      VALUES ('005930', '삼성전자', '09:10', 80100, '10:42', 82500, 1, 2400, 3.0, '익절')
    `).run()
  }

  const logCount = db.prepare('SELECT COUNT(*) as count FROM logs').get().count
  if (logCount === 0) {
    addLog('시스템 초기화 완료')
    addLog('테스트 모드로 시작했습니다')
  }
}

export function addLog(message) {
  db.prepare('INSERT INTO logs (createdAt, message) VALUES (?, ?)').run(now(), message)
}

export function rowToStatus(row) {
  return {
    ...row,
    isRunning: Boolean(row.isRunning),
  }
}
