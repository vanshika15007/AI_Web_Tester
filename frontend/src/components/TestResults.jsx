import ResultCard from './ResultCard'

const cards = [
  ['page_load', 'Page Load'],
  ['links', 'Link Check'],
  ['accessibility', 'Accessibility'],
  ['buttons', 'Button Check'],
]

function TestResults({ results, aiSummary, aiFallback, onDetailedReport }) {
  const page = results.page_load || {}
  const accessibility = results.accessibility
  const links = results.links
  const buttons = results.buttons
  const keyPoints = [
    page.status === 'pass' ? 'Page loaded successfully' : 'Page load needs attention',
    links ? (links.broken ? `${links.broken} broken link(s) found` : 'No broken links found') : null,
    accessibility ? (accessibility.missing_alt ? `${accessibility.missing_alt} image(s) missing alt text` : 'Images have alt text') : null,
    buttons ? (buttons.without_accessible_text ? `${buttons.without_accessible_text} button(s) need labels` : 'Buttons are properly labeled') : null,
  ].filter(Boolean)
  return (
    <section className="results-section">
      <div className="website-identity"><span className="website-icon">⌁</span><div><strong>{page.page_title || 'Tested website'}</strong><span>{page.final_url}</span></div><span className="completed-label">Test completed</span></div>
      <div className="section-heading"><span className="eyebrow">Report</span><h2>Test Results</h2></div>
      <div className="results-grid">
        {cards.map(([key, title]) => <ResultCard key={key} title={title} result={results[key]} />)}
      </div>
      <div className="summary-panel">
        <div className="summary-heading"><div><span className="eyebrow">AI explanation</span><h2>AI Test Summary</h2></div><span className="summary-state">● {aiFallback ? 'Rule-based Summary' : 'Powered by Gemini'}</span></div>
        <p>{aiSummary}</p>
        <h3>Key Points</h3><ul className="key-points">{keyPoints.map((point) => <li key={point}>✓ {point}</li>)}</ul>
        <h3>Recommendation</h3><p className="recommendation">{accessibility?.missing_alt ? 'Add descriptive alt text to the images to improve accessibility.' : 'Keep the tested page checks passing and review warnings before release.'}</p>
      </div>
      <div className="evidence-panel"><div><span className="eyebrow">Evidence</span><h2>Test Evidence</h2><p>Website: {page.final_url}</p><p>Page Title: {page.page_title || 'Unavailable'}</p><p>Screenshot captured: {results.evidence?.captured_at || 'Unavailable'}</p></div>{results.evidence?.screenshot ? <img src={results.evidence.screenshot} alt="Screenshot captured by Playwright" /> : <div className="screenshot-unavailable">Screenshot unavailable</div>}</div>
      <button className="secondary-button" type="button" onClick={onDetailedReport}>View Detailed Report</button>
    </section>
  )
}

export default TestResults
