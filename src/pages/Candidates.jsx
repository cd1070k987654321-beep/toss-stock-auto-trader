import { useEffect } from 'react'
import CandidateTable from '../components/CandidateTable'
import { useTradingStore } from '../store/tradingStore'

export default function Candidates() {
  const { candidates, refresh } = useTradingStore()

  useEffect(() => {
    refresh()
  }, [refresh])

  return <CandidateTable candidates={candidates} />
}
