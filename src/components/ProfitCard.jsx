import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatRate, formatWon } from '../lib/format'

const chartData = [
  { time: '09:00', profit: 0 },
  { time: '10:00', profit: 420 },
  { time: '11:00', profit: 880 },
  { time: '13:00', profit: 1260 },
  { time: '14:50', profit: 1850 },
]

export default function ProfitCard({ status }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Performance</p>
          <h2>오늘 손익</h2>
        </div>
        <span className="positive">{formatRate(status?.todayProfitRate)}</span>
      </div>
      <div className="profit-value">{formatWon(status?.todayProfit)}</div>
      <div className="profit-caption">오늘 실현/평가 손익 기준</div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Tooltip formatter={(value) => formatWon(value)} />
            <Area type="monotone" dataKey="profit" stroke="#147d64" fill="#dff5ee" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
