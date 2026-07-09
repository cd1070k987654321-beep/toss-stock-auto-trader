import { useEffect } from 'react'
import BotStatusCard from '../components/BotStatusCard'
import CandidateTable from '../components/CandidateTable'
import HoldingCard from '../components/HoldingCard'
import ProfitCard from '../components/ProfitCard'
import SystemLogPanel from '../components/SystemLogPanel'
import { useTradingStore } from '../store/tradingStore'

export default function Dashboard() {
  const { status, candidates, logs, refresh, startBot, stopBot, error } = useTradingStore()

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 5000)
    return () => clearInterval(timer)
  }, [refresh])

  return (
    <div className="page-stack">
      {error && <div className="alert">{error}</div>}
      <section className="dashboard-grid">
        <BotStatusCard status={status} onStart={startBot} onStop={stopBot} />
        <ProfitCard status={status} />
        <HoldingCard status={status} />
      </section>
      <CandidateTable candidates={candidates.slice(0, 5)} />
      <SystemLogPanel logs={logs} />
    </div>
  )
}
