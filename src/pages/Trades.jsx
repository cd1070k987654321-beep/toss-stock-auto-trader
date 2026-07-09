import { useEffect } from 'react'
import TradeLogTable from '../components/TradeLogTable'
import { useTradingStore } from '../store/tradingStore'

export default function Trades() {
  const { trades, refresh } = useTradingStore()

  useEffect(() => {
    refresh()
  }, [refresh])

  return <TradeLogTable trades={trades} />
}
