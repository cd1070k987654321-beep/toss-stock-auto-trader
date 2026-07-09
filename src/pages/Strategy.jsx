import { useEffect } from 'react'
import StrategyForm from '../components/StrategyForm'
import { useTradingStore } from '../store/tradingStore'

export default function Strategy() {
  const { strategy, refresh, updateStrategy } = useTradingStore()

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="page-stack">
      <StrategyForm strategy={strategy} onSave={updateStrategy} />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Flow</p>
            <h2>실행 흐름</h2>
          </div>
        </div>
        <div className="timeline">
          <div><strong>08:50</strong><span>프론트에서 봇 ON 확인</span></div>
          <div><strong>09:00</strong><span>백엔드 봇 자동 스캔 시작</span></div>
          <div><strong>09:00~09:10</strong><span>후보 종목 점수 계산</span></div>
          <div><strong>09:10</strong><span>점수 1등 종목 자동 매수</span></div>
          <div><strong>09:10~14:50</strong><span>익절/손절 감시</span></div>
          <div><strong>15:00</strong><span>오늘 결과 저장</span></div>
        </div>
      </section>
    </div>
  )
}
