import { WalletCards } from 'lucide-react'
import { formatWon } from '../lib/format'

export default function HoldingCard({ status }) {
  const hasHolding = Boolean(status?.currentSymbol)

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Position</p>
          <h2>현재 보유 종목</h2>
        </div>
        <WalletCards size={20} aria-hidden="true" />
      </div>
      {hasHolding ? (
        <div className="holding-box">
          <strong>{status.currentSymbol}</strong>
          <span>익절/손절 감시중</span>
          <p>평가 손익 {formatWon(status.todayProfit)}</p>
        </div>
      ) : (
        <div className="empty-state">
          <strong>포지션 없음</strong>
          <span>현재 보유 종목이 없습니다.</span>
        </div>
      )}
    </section>
  )
}
