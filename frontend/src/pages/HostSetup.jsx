import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, addQuestion, deleteQuestion, editQuestion } from '../services/api'
import { useSession } from '../contexts/SessionContext'
import QuestionEditor from '../components/QuestionEditor'
import AIGenerateForm from '../components/AIGenerateForm'
import PPTXUploader from '../components/PPTXUploader'
import TemplatesTab from '../components/TemplatesTab'
import ErrorBanner from '../components/ErrorBanner'

const TABS = [' Manual', ' AI Generate', '📎 PPTX', ' Templates']

export default function HostSetup() {
  const navigate = useNavigate()
  const { update } = useSession()

  const [sessionId,      setSessionId]      = useState(null)
  const [sessionCode,    setSessionCode]    = useState(null)
  const [presenterToken, setPresenterToken] = useState(null)
  const [sessionReady,   setSessionReady]   = useState(false)

  const [tab,        setTab]        = useState(0)
  const [questions,  setQuestions]  = useState([])
  const [editIndex,  setEditIndex]  = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [draftAI,    setDraftAI]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [initError,  setInitError]  = useState(null)
  const [error,      setError]      = useState(null)

  const initCalled = useRef(false)

  useEffect(() => {
    if (initCalled.current) return
    initCalled.current = true

    const storedToken = sessionStorage.getItem('presenterToken')
    const storedId    = sessionStorage.getItem('sessionId')
    const storedCode  = sessionStorage.getItem('sessionCode')

    if (storedToken && storedId && storedCode) {
      setPresenterToken(storedToken)
      setSessionId(storedId)
      setSessionCode(storedCode)
      update({ sessionId: storedId, sessionCode: storedCode, presenterToken: storedToken })
      setSessionReady(true)
      return
    }

    const init = async () => {
      try {
        const data = await createSession('Presenter')
        setPresenterToken(data.presenterToken)
        setSessionId(data.sessionId)
        setSessionCode(data.sessionCode)
        update({
          sessionId:      data.sessionId,
          sessionCode:    data.sessionCode,
          presenterToken: data.presenterToken,
        })
        sessionStorage.setItem('presenterToken', data.presenterToken)
        sessionStorage.setItem('sessionId',      data.sessionId)
        sessionStorage.setItem('sessionCode',    data.sessionCode)
        setSessionReady(true)
      } catch (err) {
        setInitError(err.message || 'Failed to create session. Is the backend running?')
      }
    }

    init()
  }, [])

  const handleAddManual = async (q) => {
    if (!sessionReady) {
      setError('Session is still initializing. Please wait a moment.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await addQuestion(sessionId, presenterToken, q)
      setQuestions(res.questions)
      setShowEditor(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSave = async (q) => {
    setLoading(true)
    setError(null)
    try {
      const res = await editQuestion(sessionId, presenterToken, editIndex, q)
      setQuestions(res.questions)
      setEditIndex(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (i) => {
    if (!confirm('Remove this question?')) return
    setLoading(true)
    setError(null)
    try {
      const res = await deleteQuestion(sessionId, presenterToken, i)
      setQuestions(res.questions)
      if (editIndex === i) setEditIndex(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDraft = async (q) => {
    if (!sessionReady) {
      setError('Session is still initializing. Please wait a moment.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await addQuestion(sessionId, presenterToken, {
        ...q,
        timerSeconds: q.timerSeconds || 30,
        difficulty:   q.difficulty   || 'medium',
      })
      setQuestions(res.questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAllDrafts = async () => {
    setLoading(true)
    setError(null)
    try {
      let latest = questions
      for (const q of draftAI) {
        const res = await addQuestion(sessionId, presenterToken, {
          ...q,
          timerSeconds: q.timerSeconds || 30,
          difficulty:   q.difficulty   || 'medium',
        })
        latest = res.questions
      }
      setQuestions(latest)
      setDraftAI([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTemplate = async (templateQuestions) => {
    if (!sessionReady) {
      setError('Session is still initializing. Please wait a moment.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      let latest = questions
      for (const q of templateQuestions) {
        const res = await addQuestion(sessionId, presenterToken, {
          ...q,
          timerSeconds: q.timerSeconds || 30,
          difficulty:   q.difficulty   || 'medium',
        })
        latest = res.questions
      }
      setQuestions(latest)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const goToLobby = () => {
    if (questions.length === 0) {
      setError('Add at least one question before opening the lobby.')
      return
    }
    navigate(`/host/${sessionId}/lobby`)
  }

  if (initError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Could not create session
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{initError}</p>
        <button
          className="btn-primary"
          onClick={() => {
            setInitError(null)
            initCalled.current = false
            sessionStorage.removeItem('presenterToken')
            sessionStorage.removeItem('sessionId')
            sessionStorage.removeItem('sessionCode')
            window.location.reload()
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Creating your session…</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Create Quiz</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">Session code:</span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400 text-lg tracking-widest">
              {sessionCode}
            </span>
          </div>
        </div>
        <button
          className="btn-primary btn-lg"
          onClick={goToLobby}
          disabled={questions.length === 0 || loading}
        >
          Open Lobby →
        </button>
      </div>

      
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              Questions ({questions.length})
            </h2>
          </div>

          {questions.length === 0 ? (
            <div className="card text-center py-10 text-slate-400 dark:text-slate-500">
              <p className="text-3xl mb-2"> </p>
              <p className="text-sm">No questions yet</p>
              <p className="text-xs mt-1">Use the panel on the right to add questions</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {questions.map((q, i) => (
                <li key={q._id || i} className="card p-3 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{q.text}</p>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setEditIndex(i); setShowEditor(false) }}
                      className="btn-ghost btn-sm p-1"
                      title="Edit"
                      disabled={loading}
                    >✏️</button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="btn-ghost btn-sm p-1 text-red-400 hover:text-red-600"
                      title="Delete"
                      disabled={loading}
                    > </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        
        <div className="lg:col-span-3">

          
          {editIndex !== null ? (
            <div className="card">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
                Edit Question {editIndex + 1}
              </h3>
              <QuestionEditor
                initial={questions[editIndex]}
                onSave={handleEditSave}
                onCancel={() => setEditIndex(null)}
              />
              {loading && (
                <p className="text-xs text-slate-400 mt-2 text-center animate-pulse">Saving…</p>
              )}
            </div>
          ) : (
            <>
              
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

              
              {tab === 0 && (
                <div className="card">
                  {showEditor ? (
                    <>
                      <QuestionEditor
                        onSave={handleAddManual}
                        onCancel={() => setShowEditor(false)}
                      />
                      {loading && (
                        <p className="text-xs text-slate-400 mt-2 text-center animate-pulse">
                          Adding question…
                        </p>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn-primary w-full btn-lg"
                      onClick={() => setShowEditor(true)}
                      disabled={loading}
                    >
                      + Add Question Manually
                    </button>
                  )}
                </div>
              )}

              
              {tab === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="card">
                    <AIGenerateForm
                      presenterToken={presenterToken}
                      onGenerated={(qs) => { setDraftAI(qs); setError(null) }}
                    />
                  </div>
                  {draftAI.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          Preview ({draftAI.length} questions)
                        </h3>
                        <button
                          className="btn-primary btn-sm"
                          onClick={handleAddAllDrafts}
                          disabled={loading}
                        >
                          {loading ? 'Adding…' : 'Add All to Quiz'}
                        </button>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {draftAI.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5 shrink-0">
                              Q{i + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{q.text}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                ✓ {q.options[q.correctIndex]}
                              </p>
                            </div>
                            <button
                              className="btn-primary btn-sm shrink-0"
                              onClick={() => handleAddDraft(q)}
                              disabled={loading}
                            >
                              Add
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              
              {tab === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="card">
                    <PPTXUploader
                      presenterToken={presenterToken}
                      onGenerated={(qs) => { setDraftAI(qs); setError(null) }}
                    />
                  </div>
                  {draftAI.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          Extracted Questions ({draftAI.length})
                        </h3>
                        <button
                          className="btn-primary btn-sm"
                          onClick={handleAddAllDrafts}
                          disabled={loading}
                        >
                          {loading ? 'Adding…' : 'Add All'}
                        </button>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {draftAI.map((q, i) => (
                          <li key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs">
                            <p className="font-medium text-slate-700 dark:text-slate-200">{q.text}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                              ✓ {q.options[q.correctIndex]}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              
              {tab === 3 && (
                <TemplatesTab
                  onAddAll={handleAddTemplate}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
