function ResultCard({ title, result }) {
  if (!result) return null

  const isWarning = result.status === 'warning'
  const statusLabel = isWarning ? 'Warning' : 'Pass'
  const labels = { http_status: 'Status', page_title: 'Page Title', load_time_ms: 'Load Time', checked: 'Links Checked', broken: 'Broken Links', images: 'Images Checked', missing_alt: 'Missing Alt Text', buttons_found: 'Buttons Found', without_accessible_text: 'Without Accessible Text', final_url: 'Final URL', unlabeled_buttons: 'Unlabeled Buttons' }

  return (
    <article className="result-card">
      <div className="result-card-heading">
        <h3>{title}</h3>
        <span className={`status-badge ${isWarning ? 'warning' : 'pass'}`}>
          {isWarning ? '!' : '✓'} {statusLabel}
        </span>
      </div>
      <div className="result-details">
        {Object.entries(result).map(([key, value]) => {
          if (key === 'status' || key === 'broken_links' || key === 'message') return null
          const label = labels[key] || key.replaceAll('_', ' ')
          let displayValue = String(value)
          if (key === 'load_time_ms') displayValue = `${(Number(value) / 1000).toFixed(2)} seconds`
          if (key === 'http_status' && Number(value)) displayValue = `${value} ${Number(value) < 400 ? 'OK' : 'Error'}`
          return <p key={key}><span>{label}</span><strong>{displayValue}</strong></p>
        })}
        {result.broken_links?.length > 0 && (
          <p><span>broken links</span><strong>{result.broken_links.join(', ')}</strong></p>
        )}
        {result.message && <p className="result-message">{result.message}</p>}
      </div>
    </article>
  )
}

export default ResultCard
