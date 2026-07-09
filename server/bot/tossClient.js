function redact(value) {
  if (!value) return value
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]')
    .replace(/(client_secret=)[^&]+/g, '$1[REDACTED]')
}

function makeClientOrderId(prefix) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${stamp}-${random}`.slice(0, 36)
}

export class TossClient {
  constructor({
    live = false,
    liveOrderEnabled = false,
    clientId = '',
    clientSecret = '',
    apiBaseUrl = '',
    accountSeq = '',
  } = {}) {
    this.live = live
    this.liveOrderEnabled = liveOrderEnabled
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '')
    this.accountSeq = accountSeq
    this.token = null
    this.tokenExpiresAt = 0
  }

  assertLiveReady() {
    if (!this.clientId || !this.clientSecret || !this.apiBaseUrl) {
      throw new Error('토스 API 실전 연결에 필요한 환경변수가 설정되지 않았습니다.')
    }
  }

  assertOrderReady() {
    this.assertLiveReady()
    if (!this.liveOrderEnabled) {
      throw new Error('실전 주문 차단: TOSS_LIVE_ORDER_ENABLED=true 설정이 필요합니다.')
    }
    if (!this.accountSeq) {
      throw new Error('실전 주문 차단: TOSS_ACCOUNT_SEQ 설정이 필요합니다.')
    }
  }

  async getAccessToken() {
    this.assertLiveReady()
    const now = Date.now()
    if (this.token && now < this.tokenExpiresAt - 60_000) {
      return this.token
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    const response = await fetch(`${this.apiBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(`토스 토큰 발급 실패: ${response.status} ${redact(JSON.stringify(data))}`)
    }

    this.token = data.access_token
    this.tokenExpiresAt = Date.now() + Number(data.expires_in || 0) * 1000
    return this.token
  }

  async request(path, { method = 'GET', body, accountRequired = false } = {}) {
    const token = await this.getAccessToken()
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    }

    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    if (accountRequired) {
      if (!this.accountSeq) {
        throw new Error('TOSS_ACCOUNT_SEQ 설정이 필요합니다.')
      }
      headers['X-Tossinvest-Account'] = String(this.accountSeq)
    }

    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(`토스 API 요청 실패: ${response.status} ${redact(JSON.stringify(data))}`)
    }

    return data
  }

  async scanMarket() {
    return { ok: true, source: this.live ? 'toss-api' : 'mock-market' }
  }

  async getAccounts() {
    if (!this.live) {
      return { accounts: [] }
    }

    return this.request('/api/v1/accounts')
  }

  async placeBuyOrder({ symbol, budget, quantity = '1', price, orderType = 'MARKET' }) {
    if (!this.live) {
      return { ok: true, orderId: `TEST-BUY-${symbol}`, symbol, budget }
    }

    this.assertOrderReady()
    const payload = {
      clientOrderId: makeClientOrderId('buy'),
      symbol,
      side: 'BUY',
      orderType,
      quantity: String(quantity),
    }

    if (orderType === 'LIMIT') {
      payload.price = String(price)
    }

    return this.request('/api/v1/orders', {
      method: 'POST',
      accountRequired: true,
      body: payload,
    })
  }

  async placeSellOrder({ symbol, quantity = '1', price, orderType = 'MARKET', reason }) {
    if (!this.live) {
      return { ok: true, orderId: `TEST-SELL-${symbol}`, symbol, reason }
    }

    this.assertOrderReady()
    const payload = {
      clientOrderId: makeClientOrderId('sell'),
      symbol,
      side: 'SELL',
      orderType,
      quantity: String(quantity),
    }

    if (orderType === 'LIMIT') {
      payload.price = String(price)
    }

    return this.request('/api/v1/orders', {
      method: 'POST',
      accountRequired: true,
      body: payload,
    })
  }
}
