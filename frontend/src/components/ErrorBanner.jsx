import { useState } from 'react'

export default function ErrorBanner({ message, onRetry, onDismiss }) {
  const [visible, setVisible] = useState(true)
  if (!visible || !message) return null

  const dismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 animate-slide-down"
    >
      <span className="text-xl mt-0.5" aria-hidden>⚠️</span>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss error"
          className="text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
