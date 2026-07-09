import { formatNumber, formatRate, formatWon } from '../lib/format'

export default function CandidateTable({ candidates }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Scan Result</p>
          <h2>후보 종목</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>종목명</th>
              <th>현재가</th>
              <th>등락률</th>
              <th>거래량</th>
              <th>거래대금</th>
              <th>점수</th>
              <th>선택 이유</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.symbol}>
                <td>
                  <strong>{candidate.name}</strong>
                  <span>{candidate.symbol}</span>
                </td>
                <td>{formatWon(candidate.price)}</td>
                <td className={candidate.changeRate >= 0 ? 'positive' : 'negative'}>{formatRate(candidate.changeRate)}</td>
                <td>{formatNumber(candidate.volume)}</td>
                <td>{formatWon(candidate.tradingValue)}</td>
                <td><span className="score">{candidate.score}</span></td>
                <td>{candidate.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
