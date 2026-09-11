import { useState } from 'react'

const testOptions = [
  ['page_load', 'Page Load'],
  ['links', 'Link Check'],
  ['accessibility', 'Accessibility Check'],
  ['buttons', 'Button Check'],
]

function TestForm({ onSubmit, loading, url, onUrlChange }) {
  const [tests, setTests] = useState(testOptions.map(([value]) => value))
  const [customInstruction, setCustomInstruction] = useState('')

  function toggleTest(value) {
    setTests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(url, tests, customInstruction)
  }

  return (
    <form className="test-form" onSubmit={handleSubmit}>
      <label htmlFor="website-url">Website URL</label>
      <input id="website-url" type="url" value={url} onChange={(event) => onUrlChange(event.target.value)} placeholder="https://example.com" required />
      <fieldset>
        <legend>Tests to run</legend>
        <div className="test-options">
          {testOptions.map(([value, label]) => (
            <label className="check-option" key={value}>
              <input type="checkbox" checked={tests.includes(value)} onChange={() => toggleTest(value)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor="custom-instruction">Or add a custom instruction <span>(optional)</span></label>
      <textarea id="custom-instruction" value={customInstruction} onChange={(event) => setCustomInstruction(event.target.value)} placeholder="e.g. Check for broken links and accessibility issues..." rows="3" />
      <button type="submit" disabled={loading || (tests.length === 0 && !customInstruction.trim())}>
        {loading ? 'Running tests...' : 'Run Tests'}
      </button>
    </form>
  )
}

export default TestForm
