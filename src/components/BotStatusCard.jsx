import { Power, Radio } from 'lucide-react'

const phaseLabels = {
  waiting: '대기',
  scanning: '스캔중',
  bought: '매수완료',
  watching: '감시중',
  closed: '종료',
}

export default function BotStatusCard({ status, onStart, onStop }) {
  const running = Boolean(status?.isRunning)

  return (
    <section className="panel status-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">오늘 상태</p>
          <h2>봇 상태</h2>
        </div>
        <span className={`status-dot ${running ? 'active' : ''}`}>
          <Radio size={14} aria-hidden="true" />
          {running ? 'ON' : 'OFF'}
        </span>
      </div>
      <div className="phase-display">
        <span>현재 단계</span>
        <strong>{phaseLabels[status?.phase] ?? '대기'}</strong>
        <small>{running ? '봇 엔진이 다음 시장 이벤트를 기다리고 있습니다.' : '시작 버튼을 누르면 스캔 준비 상태로 전환됩니다.'}</small>
      </div>
      <div className="meta-grid">
        <div>
          <span>모드</span>
          <strong>{status?.mode === 'live' ? '실전' : '테스트'}</strong>
        </div>
        <div>
          <span>현재 종목</span>
          <strong>{status?.currentSymbol || '-'}</strong>
        </div>
      </div>
      <button className={`primary-action ${running ? 'danger' : ''}`} onClick={running ? onStop : onStart}>
        <Power size={18} aria-hidden="true" />
        {running ? '봇 끄기' : '봇 켜기'}
      </button>
    </section>
  )
}
