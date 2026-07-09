export default function SystemLogPanel({ logs }) {
  return (
    <section className="panel log-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">System</p>
          <h2>시스템 로그</h2>
        </div>
      </div>
      <div className="log-list">
        {logs.map((log) => (
          <div key={log.id} className="log-row">
            <time>{log.createdAt}</time>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
