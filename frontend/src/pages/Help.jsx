const faqs = [
  { q: 'Do I need an account to join?',         a: 'No! Participants just need a session code and a display name. No signup required.' },
  { q: 'How is the score calculated?',           a: 'Score = 100 (base) + up to 50 bonus points based on how quickly you answer. Faster correct answers earn more.' },
  { q: 'What happens if I skip a question?',     a: 'Skipped questions score 0 but have no penalty. You\'ll see the correct answers in your post-session summary.' },
  { q: 'Can I reconnect if I lose connection?',  a: 'Yes! If you reconnect within 60 seconds using the same session code and name, your score is preserved.' },
  { q: 'How do I generate questions with AI?',   a: 'In the Host Setup page, switch to the "AI Generate" tab, enter a topic, choose difficulty and count, then click Generate.' },
  { q: 'What file format does PPTX upload support?', a: 'Only .pptx files up to 20 MB. The AI will extract text from each slide and generate quiz questions.' },
]

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="text-center mb-10 animate-slide-up">
        <div className="text-5xl mb-3">❓</div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Help & FAQ</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Everything you need to know about QuizBlitz</p>
      </div>

      {/* Quick start */}
      <div className="card mb-8 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 border-brand-200 dark:border-brand-800">
        <h2 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4">🚀 Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-brand-700 dark:text-brand-300 mb-2">For Hosts</h3>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
              <li>Click "Host a Quiz" on the home page</li>
              <li>Add questions manually, via AI, or from a PPTX</li>
              <li>Click "Open Lobby" and share the session code</li>
              <li>Start the quiz when participants have joined</li>
              <li>Use Next/Prev to control question flow</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold text-brand-700 dark:text-brand-300 mb-2">For Participants</h3>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
              <li>Click "Join a Quiz" on the home page</li>
              <li>Enter the session code and your name</li>
              <li>Wait in the lobby for the host to start</li>
              <li>Answer questions before the timer runs out</li>
              <li>Check your results in the summary page</li>
            </ol>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4">Frequently Asked Questions</h2>
      <div className="flex flex-col gap-3">
        {faqs.map(({ q, a }, i) => (
          <details key={i} className="card group cursor-pointer">
            <summary className="font-semibold text-slate-800 dark:text-slate-100 text-sm list-none flex items-center justify-between">
              {q}
              <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
            </summary>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* Scoring table */}
      <div className="card mt-8">
        <h2 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4">🧮 Scoring Formula</h2>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 font-mono text-sm text-center mb-4">
          score = 100 + (remainingTime / totalTime) × 50
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {[
            { label: 'Instant answer', score: '150', color: 'text-emerald-600' },
            { label: 'Half time left', score: '125', color: 'text-yellow-600' },
            { label: 'Last second',    score: '~100', color: 'text-red-500' },
          ].map(({ label, score, color }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className={`text-xl font-extrabold ${color}`}>{score}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
