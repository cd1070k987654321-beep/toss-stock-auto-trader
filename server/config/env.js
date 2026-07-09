import 'dotenv/config'

export const env = {
  port: process.env.PORT || 4000,
  tradingMode: process.env.TOSS_TRADING_MODE === 'live' ? 'live' : 'test',
  liveOrderEnabled: process.env.TOSS_LIVE_ORDER_ENABLED === 'true',
  tossClientId: process.env.TOSS_CLIENT_ID || '',
  tossClientSecret: process.env.TOSS_CLIENT_SECRET || '',
  tossApiBaseUrl: process.env.TOSS_API_BASE_URL || 'https://openapi.tossinvest.com',
  tossAccountSeq: process.env.TOSS_ACCOUNT_SEQ || '',
}

export function getTossCredentialStatus() {
  return {
    mode: env.tradingMode,
    hasClientId: Boolean(env.tossClientId),
    hasClientSecret: Boolean(env.tossClientSecret),
    hasApiBaseUrl: Boolean(env.tossApiBaseUrl),
    hasAccountSeq: Boolean(env.tossAccountSeq),
    liveOrderEnabled: env.liveOrderEnabled,
    liveReady: env.tradingMode === 'live'
      && Boolean(env.tossClientId)
      && Boolean(env.tossClientSecret)
      && Boolean(env.tossApiBaseUrl)
      && Boolean(env.tossAccountSeq)
      && env.liveOrderEnabled,
  }
}
