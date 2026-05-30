import { useRef, useState } from 'react'
import { uploadPPTX } from '../services/api'
import ErrorBanner from './ErrorBanner'

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export default function PPTXUploader({ presenterToken, onGenerated }) {
  const inputRef = useRef()
  const [file,       setFile]       = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [count,      setCount]      = useState(5)
  const [provider,   setProvider]   = useState('groq')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.pptx')) return setError('Only .pptx files are accepted.')
    if (f.size > MAX_SIZE)         return setError('File must be under 20 MB.')
    setError(null)
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return setError('Please select a .pptx file.')
    setLoading(true)
    setError(null)
    try {
      const data = await uploadPPTX(presenterToken, file, count, difficulty, provider)
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

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all"
      >
        <p className="text-4xl mb-2">📎</p>
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          {file ? file.name : 'Drop your .pptx file here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">or click to browse · max 20 MB</p>
        <input
          ref={inputRef} type="file" accept=".pptx" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
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
          <label className="label">Questions</label>
          <input type="number" min={1} max={20} className="input" value={count}
            onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">AI Provider</label>
          <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="groq">Groq (Free)</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
      </div>

      <button className="btn-primary btn-lg w-full" onClick={handleUpload} disabled={loading || !file}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing…
          </span>
        ) : 'Extract & Generate Questions'}
      </button>
    </div>
  )
}
