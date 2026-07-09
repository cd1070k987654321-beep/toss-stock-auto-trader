import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

const fields = [
  ['scanStart', '시작 시간', 'time'],
  ['scanEnd', '스캔 종료', 'time'],
  ['budget', '투자금', 'number'],
  ['takeProfit', '익절 (%)', 'number'],
  ['stopLoss', '손절 (%)', 'number'],
  ['forceSellTime', '강제청산', 'time'],
  ['maxTradesPerDay', '하루 최대 거래 횟수', 'number'],
]

export default function StrategyForm({ strategy, onSave }) {
  const [form, setForm] = useState(strategy ?? {})

  useEffect(() => {
    setForm(strategy ?? {})
  }, [strategy])

  function update(name, value, type) {
    setForm((current) => ({
      ...current,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  function submit(event) {
    event.preventDefault()
    onSave(form)
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Strategy</p>
          <h2>전략 설정</h2>
        </div>
        <button className="icon-button" title="저장" aria-label="저장">
          <Save size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="form-grid">
        {fields.map(([name, label, type]) => (
          <label key={name} className="field">
            <span>{label}</span>
            <input
              type={type}
              value={form[name] ?? ''}
              onChange={(event) => update(name, event.target.value, type)}
            />
          </label>
        ))}
      </div>
    </form>
  )
}
