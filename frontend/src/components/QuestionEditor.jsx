import { useState } from 'react'

const EMPTY = { text: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'medium', timerSeconds: 30 }

export default function QuestionEditor({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setOption = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm((f) => ({ ...f, options: opts }))
  }

  const validate = () => {
    const e = {}
    if (!form.text.trim())                    e.text = 'Question text is required.'
    form.options.forEach((o, i) => { if (!o.trim()) e[`opt${i}`] = `Option ${i + 1} is required.` })
    if (form.timerSeconds < 5 || form.timerSeconds > 120) e.timer = 'Timer must be 5–120 seconds.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => { if (validate()) onSave(form) }

  return (
    <div className="flex flex-col gap-4">
      {/* Question text */}
      <div>
        <label className="label">Question *</label>
        <textarea
          className={`input resize-none h-20 ${errors.text ? 'border-red-400' : ''}`}
          placeholder="Enter your question…"
          value={form.text}
          onChange={(e) => set('text', e.target.value)}
        />
        {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text}</p>}
      </div>

      {/* Options */}
      <div>
        <label className="label">Answer Options *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {form.options.map((opt, i) => (
            <div key={i} className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${
                form.correctIndex === i ? 'text-emerald-500' : 'text-slate-400'
              }`}>
                {['A', 'B', 'C', 'D'][i]}
              </span>
              <input
                className={`input pl-8 ${errors[`opt${i}`] ? 'border-red-400' : ''} ${
                  form.correctIndex === i ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : ''
                }`}
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Correct answer */}
      <div>
        <label className="label">Correct Answer *</label>
        <div className="flex gap-2">
          {['A', 'B', 'C', 'D'].map((l, i) => (
            <button
              key={i}
              type="button"
              onClick={() => set('correctIndex', i)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                form.correctIndex === i
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty + Timer */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Difficulty</label>
          <select className="input" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="label">Timer (seconds)</label>
          <input
            type="number" min={5} max={120}
            className={`input ${errors.timer ? 'border-red-400' : ''}`}
            value={form.timerSeconds}
            onChange={(e) => set('timerSeconds', Number(e.target.value))}
          />
          {errors.timer && <p className="text-xs text-red-500 mt-1">{errors.timer}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && <button className="btn-secondary" onClick={onCancel}>Cancel</button>}
        <button className="btn-primary" onClick={handleSave}>
          {initial ? 'Save Changes' : 'Add Question'}
        </button>
      </div>
    </div>
  )
}
