import { formatRate, formatWon } from '../lib/format'

export default function TradeLogTable({ trades }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Execution</p>
          <h2>거래 로그</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>매수 시간</th>
              <th>매수 종목</th>
              <th>매수가</th>
              <th>매도 시간</th>
              <th>매도가</th>
              <th>수익률</th>
              <th>수익금</th>
              <th>매도 사유</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td>{trade.buyTime}</td>
                <td>
                  <strong>{trade.name}</strong>
                  <span>{trade.symbol}</span>
                </td>
                <td>{formatWon(trade.buyPrice)}</td>
                <td>{trade.sellTime || '-'}</td>
                <td>{trade.sellPrice ? formatWon(trade.sellPrice) : '-'}</td>
                <td className={trade.profitRate >= 0 ? 'positive' : 'negative'}>{formatRate(trade.profitRate)}</td>
                <td>{formatWon(trade.profit)}</td>
                <td>{trade.sellReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
