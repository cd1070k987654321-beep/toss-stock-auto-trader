import { NavLink, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { BarChart3, Bot, Clock3, ListChecks, ScrollText, Server, ShieldCheck } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Strategy from './pages/Strategy'
import Candidates from './pages/Candidates'
import Trades from './pages/Trades'
import Settings from './pages/Settings'

const navItems = [
  { to: '/', label: '대시보드', icon: BarChart3 },
  { to: '/strategy', label: '전략 설정', icon: ListChecks },
  { to: '/candidates', label: '후보 종목', icon: Bot },
  { to: '/trades', label: '거래 로그', icon: ScrollText },
  { to: '/settings', label: '안전 설정', icon: ShieldCheck },
]

function App() {
  return (
    <Router>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">T</div>
            <div>
              <strong>토스주식 자동매매</strong>
              <span>Trading Bot Control</span>
            </div>
          </div>
          <nav className="nav-list" aria-label="주요 화면">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-item">
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
          <div className="security-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>React는 토스 API 키를 보관하지 않습니다.</span>
          </div>
        </aside>
        <main className="main-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">React 관리자 화면 / API 서버 / Bot Engine</p>
              <h1>자동매매 조종실</h1>
              <p className="topbar-copy">봇 실행 상태, 후보 종목, 손익과 안전 장치를 한 화면에서 통제합니다.</p>
            </div>
            <div className="topbar-actions">
              <div className="info-chip">
                <Clock3 size={15} aria-hidden="true" />
                09:00 스캔
              </div>
              <div className="info-chip">
                <Server size={15} aria-hidden="true" />
                API 대기
              </div>
              <div className="mode-pill">TEST MODE</div>
            </div>
          </header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
