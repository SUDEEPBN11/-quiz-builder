import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, addQuestion, deleteQuestion, editQuestion } from '../services/api'
import { useSession } from '../contexts/SessionContext'
import QuestionEditor from '../components/QuestionEditor'
import AIGenerateForm from '../components/AIGenerateForm'
import PPTXUploader from '../components/PPTXUploader'
import ErrorBanner from '../components/ErrorBanner'

const TABS = ['✏️ Manual', '✨ AI Generate', '📎 PPTX']

export default function HostSetup() {
  const navigate = useNavigate()
  const { update, session } = useSession()

  const [tab,         setTab]         = useState(0)
  const [questions,   setQuestions]   = useState([])
  const [editIndex,   setEditIndex]   = useState(null)
  const [showEditor,  setShowEditor]  = useState(false)
  const [draftAI,     setDraftAI]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [sessionData, setSessionData] = useState(null)

  // Create session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await createSession('Presenter')
        setSessionData(data)
        update({
          sessionId:      data.sessionId,
          sessionCode:    data.sessionCode,
          presenterToken: data.presenterToken,
        })
        sessionStorage.setItem('presenterToken', data.presenterToken)
        sessionStorage.setItem('sessionId',      data.sessionId)
        sessionStorage.setItem('sessionCode',    data.sessionCode)
      } catch (err) {
        setError(err.message)
      }
    }
    if (!session.sessionId) init()
    else setSessionData({ sessionId: session.sessionId, sessionCode: session.sessionCode, presenterToken: session.presenterToken })
  }, [])

  const presenterToken = sessionData?.presenterToken || session.presenterToken
  const sessionId      = sessionData?.sessionId      || session.sessionId

  const handleAddManual = async (q) => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await addQuestion(sessionId, presenterToken, q)
      setQuestions(res.questions)
      setShowEditor(false)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleEditSave = async (q) => {
    setLoading(true)
    try {
      const res = await editQuestion(sessionId, presenterToken, editIndex, q)
      setQuestions(res.questions)
      setEditIndex(null)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleDelete = async (i) => {
    if (!confirm('Remove this question?')) return
    setLoading(true)
    try {
      const res = await deleteQuestion(sessionId, presenterToken, i)
      setQuestions(res.questions)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleAddDraft = async (q) => {
    setLoading(true)
    try {
      const res = await addQuestion(sessionId, presenterToken, { ...q, timerSeconds: 30, difficulty: q.difficulty || 'medium' })
      setQuestions(res.questions)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleAddAllDrafts = async () => {
    for (const q of draftAI) await handleAddDraft(q)
    setDraftAI([])
  }

  const goToLobby = () => {
    if (questions.length === 0) return setError('Add at least one question before starting.')
    navigate(`/host/${sessionId}/lobby`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Create Quiz</h1>
          {sessionData && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">Session code:</span>
              <span className="font-extrabold text-brand-600 dark:text-brand-400 text-lg tracking-widest">
                {sessionData.sessionCode}
              </span>
            </div>
          )}
        </div>
        <button
          className="btn-primary btn-lg"
          onClick={goToLobby}
          disabled={questions.length === 0}
        >
          Open Lobby →
        </button>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: question list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              Questions ({questions.length})
            </h2>
          </div>

          {questions.length === 0 ? (
            <div className="card text-center py-10 text-slate-400 dark:text-slate-500">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-sm">No questions yet</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {questions.map((q, i) => (
                <li key={i} className="card p-3 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{q.text}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditIndex(i); setShowEditor(false) }} className="btn-ghost btn-sm p-1" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(i)} className="btn-ghost btn-sm p-1 text-red-400 hover:text-red-600" title="Delete">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: editor / AI / PPTX */}
        <div className="lg:col-span-3">
          {/* Edit existing */}
          {editIndex !== null ? (
            <div className="card">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Edit Question {editIndex + 1}</h3>
              <QuestionEditor
                initial={questions[editIndex]}
                onSave={handleEditSave}
                onCancel={() => setEditIndex(null)}
              />
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
                {TABS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setTab(i); setShowEditor(false) }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      tab === i
                        ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Manual tab */}
              {tab === 0 && (
                <div className="card">
                  {showEditor ? (
                    <QuestionEditor onSave={handleAddManual} onCancel={() => setShowEditor(false)} />
                  ) : (
                    <button className="btn-primary w-full btn-lg" onClick={() => setShowEditor(true)}>
                      + Add Question Manually
                    </button>
                  )}
                </div>
              )}

              {/* AI tab */}
              {tab === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="card">
                    <AIGenerateForm
                      presenterToken={presenterToken}
                      onGenerated={(qs) => setDraftAI(qs)}
                    />
                  </div>
                  {draftAI.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          Preview ({draftAI.length} questions)
                        </h3>
                        <button className="btn-primary btn-sm" onClick={handleAddAllDrafts} disabled={loading}>
                          Add All to Quiz
                        </button>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {draftAI.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5 shrink-0">Q{i+1}</span>
                            <div className="flex-1">
                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{q.text}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">✓ {q.options[q.correctIndex]}</p>
                            </div>
                            <button className="btn-primary btn-sm shrink-0" onClick={() => handleAddDraft(q)} disabled={loading}>Add</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* PPTX tab */}
              {tab === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="card">
                    <PPTXUploader
                      presenterToken={presenterToken}
                      onGenerated={(qs) => setDraftAI(qs)}
                    />
                  </div>
                  {draftAI.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          Extracted Questions ({draftAI.length})
                        </h3>
                        <button className="btn-primary btn-sm" onClick={handleAddAllDrafts} disabled={loading}>
                          Add All
                        </button>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {draftAI.map((q, i) => (
                          <li key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs">
                            <p className="font-medium text-slate-700 dark:text-slate-200">{q.text}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓ {q.options[q.correctIndex]}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
