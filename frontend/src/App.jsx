import { useEffect, useState } from 'react'
import TestForm from './components/TestForm'
import TestResults from './components/TestResults'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

function App() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [aiMode, setAiMode] = useState('fallback')
  const [detailed, setDetailed] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then((response) => response.json()).then((data) => setAiMode(data.ai_mode || 'fallback')).catch(() => setAiMode('fallback'))
  }, [])

  async function runTests(url, tests, customInstruction) {
    setLoading(true)
    setError('')
    setReport(null)
    setDetailed(false)
    try {
      const response = await fetch(`${API_URL}/api/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, tests, custom_instruction: customInstruction }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'The tests could not be completed.')
      setReport(data)
      setAiMode(data.ai_mode || (data.ai_fallback ? 'fallback' : 'active'))
    } catch (requestError) {
      setError(requestError.message.includes('Failed to fetch') ? 'Unable to connect to the testing server.' : requestError.message || 'The website could not be tested.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <nav className="topbar"><a className="brand" href="/"><img src="/logo.svg" alt="" /> <span>AI Web Tester</span></a><span className={`ai-status ${aiMode}`}><i /> AI Mode: {aiMode === 'active' ? 'Active' : 'Fallback'}</span></nav>
        <p className="eyebrow">Playwright + Gemini</p>
        <h1>AI Web Tester</h1>
        <p className="intro">Run simple automated tests on any website.</p>
      </header>
      <section className="workspace">
        <div className="form-panel">
          <div className="section-heading"><span className="eyebrow">Start a check</span><h2>Choose your tests</h2></div>
          <TestForm onSubmit={runTests} loading={loading} url={websiteUrl} onUrlChange={setWebsiteUrl} />
          {loading && <div className="running-state"><strong>RUNNING TESTS...</strong><span>Please wait while we test the website and analyze the results.</span><div className="progress-track"><i /></div><small>Playwright is checking the selected tests...</small></div>}
          {error && <div className="error-message" role="alert">{error}</div>}
        </div>
        <aside className="context-column"><WebsitePreview url={websiteUrl} /><HowItWorks /></aside>
        {report ? (detailed ? <DetailedReport report={report} onBack={() => setDetailed(false)} /> : <TestResults results={report.results} aiSummary={report.ai_summary} aiFallback={report.ai_fallback} onDetailedReport={() => setDetailed(true)} />) : <ReadyState />}
      </section>
      <footer>© 2026 Vanshika Sharma. All rights reserved..</footer>
    </main>
  )
}

function ReadyState() {
  return <section className="ready-state"><span className="eyebrow">Workspace</span><h2>READY TO TEST</h2><p>Enter a website URL and choose the checks you'd like Playwright to perform.</p><ul><li>✓ Page Load</li><li>✓ Link Check</li><li>✓ Accessibility</li><li>✓ Button Check</li></ul></section>
}

function WebsitePreview({ url }) {
  let domain = 'your website'
  try { domain = new URL(url).hostname } catch { /* The form will validate the URL on submit. */ }
  return <div className="preview-card"><span className="eyebrow">Website preview</span><h2>🌐 {domain}</h2><p>{url || 'Enter a URL to preview it here.'}</p><div className="browser-preview"><div><i /><i /><i /></div><span>{domain}</span><strong>Preview unavailable</strong></div></div>
}

function HowItWorks() {
  return <div className="how-card"><span className="eyebrow">Simple workflow</span><h2>How it works</h2><ol><li><b>01</b><span>Enter a website URL</span></li><li><b>02</b><span>Choose tests</span></li><li><b>03</b><span>Playwright runs automated checks</span></li><li><b>04</b><span>Gemini explains the results</span></li></ol></div>
}

function DetailedReport({ report, onBack }) {
  const page = report.results.page_load || {}
  return <section className="detailed-report"><button className="back-button" type="button" onClick={onBack}>← Back to Results</button><span className="eyebrow">Detailed Test Report</span><h2>{page.page_title || 'Website report'}</h2><p className="report-url">{page.final_url}</p><div className="detail-list">{Object.entries(report.results).filter(([key]) => key !== 'evidence').map(([key, value], index) => <article key={key}><h3>{index + 1}. {key.replaceAll('_', ' ')}</h3><span className={`status-badge ${value.status === 'warning' ? 'warning' : 'pass'}`}>{value.status === 'warning' ? '!' : '✓'} {value.status}</span>{Object.entries(value).filter(([field]) => field !== 'status' && field !== 'broken_links').map(([field, detail]) => <p key={field}><span>{field.replaceAll('_', ' ')}</span><strong>{String(detail)}</strong></p>)}</article>)}</div><div className="detail-analysis"><h3>AI Analysis</h3><p>{report.ai_summary}</p></div>{report.results.evidence?.screenshot && <img className="detail-screenshot" src={report.results.evidence.screenshot} alt="Detailed Playwright evidence" />}</section>
}

export default App
