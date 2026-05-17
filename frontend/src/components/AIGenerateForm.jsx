import { useState } from 'react'
import { generateAIQuestions } from '../services/api'
import ErrorBanner from './ErrorBanner'

export default function AIGenerateForm({ presenterToken, onGenerated }) {
  const [topic,      setTopic]      = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [count,      setCount]      = useState(5)
  const [provider,   setProvider]   = useState('gemini')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const handleGenerate = async () => {
    if (!topic.trim()) return setError('Please enter a topic.')
    setError(null)
    setLoading(true)
    try {
      const data = await generateAIQuestions(presenterToken, topic.trim(), difficulty, count, provider)
      onGenerated(data.questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div>
        <label className="label">Topic *</label>
        <input
          className="input"
          placeholder="e.g. World War II, Python basics, Solar System…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Difficulty</label>
          <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="label">Count</label>
          <input type="number" min={1} max={20} className="input" value={count}
            onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">AI Provider</label>
          <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
      </div>

      <button
        className="btn-primary btn-lg w-full"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating…
          </span>
        ) : (
          <span>✨ Generate Questions</span>
        )}
      </button>
    </div>
  )
}
