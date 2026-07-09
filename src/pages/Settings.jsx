import { useEffect, useState } from 'react'
import EmergencySellButton from '../components/EmergencySellButton'
import SystemLogPanel from '../components/SystemLogPanel'
import { formatWon } from '../lib/format'
import { useTradingStore } from '../store/tradingStore'

export default function Settings() {
  const { status, strategy, config, logs, refresh, emergencySell } = useTradingStore()
  const [message, setMessage] = useState('')

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleEmergencySell() {
    const confirmed = window.confirm('실전 긴급 매도 주문을 요청할까요?')
    if (!confirmed) return
    const result = await emergencySell()
    setMessage(result.message)
  }

  return (
    <div className="page-stack">
      {message && <div className="alert success">{message}</div>}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Safety</p>
            <h2>API/안전 설정</h2>
          </div>
        </div>
        <div className="settings-grid">
          <label className="toggle-row">
            <span>
              <strong>실전 주문</strong>
              <small>현재는 기본 테스트 모드입니다.</small>
            </span>
            <input type="checkbox" checked={status?.mode === 'live'} readOnly />
          </label>
          <label className="toggle-row">
            <span>
              <strong>10만 원 초과 주문 차단</strong>
              <small>현재 투자금 {formatWon(strategy?.budget)}</small>
            </span>
            <input type="checkbox" checked readOnly />
          </label>
          <label className="field">
            <span>하루 손실 제한</span>
            <input value="-30,000원" readOnly />
          </label>
          <EmergencySellButton onClick={handleEmergencySell} />
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Credentials</p>
            <h2>Open API 키 상태</h2>
          </div>
          <span className={`status-dot ${config?.liveReady ? 'active' : ''}`}>
            {config?.liveReady ? 'LIVE READY' : 'TEST SAFE'}
          </span>
        </div>
        <div className="settings-grid">
          <div className="toggle-row">
            <span>
              <strong>Client ID</strong>
              <small>{config?.hasClientId ? '서버 환경변수에 설정됨' : '.env에 아직 없음'}</small>
            </span>
          </div>
          <div className="toggle-row">
            <span>
              <strong>Client Secret</strong>
              <small>{config?.hasClientSecret ? '서버 환경변수에 설정됨' : '.env에 아직 없음'}</small>
            </span>
          </div>
          <div className="toggle-row">
            <span>
              <strong>API Base URL</strong>
              <small>{config?.hasApiBaseUrl ? '서버 환경변수에 설정됨' : '.env에 아직 없음'}</small>
            </span>
          </div>
          <div className="toggle-row">
            <span>
              <strong>계좌 Seq</strong>
              <small>{config?.hasAccountSeq ? '주문 계좌가 설정됨' : '계좌 seq가 아직 없음'}</small>
            </span>
          </div>
          <div className="toggle-row">
            <span>
              <strong>실전 주문 허용</strong>
              <small>{config?.liveOrderEnabled ? '서버 플래그 ON' : '서버 플래그 OFF'}</small>
            </span>
          </div>
          <div className="toggle-row">
            <span>
              <strong>주문 모드</strong>
              <small>{config?.mode === 'live' ? '실전 모드 요청됨' : '테스트 모드 고정'}</small>
            </span>
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">API Boundary</p>
            <h2>토스 API 연결 원칙</h2>
          </div>
        </div>
        <div className="architecture">
          <span>React 관리자 화면</span>
          <strong>/</strong>
          <span>API 서버</span>
          <strong>/</strong>
          <span>Trading Bot Engine</span>
          <strong>/</strong>
          <span>토스증권 API</span>
        </div>
      </section>
      <SystemLogPanel logs={logs} />
    </div>
  )
}
