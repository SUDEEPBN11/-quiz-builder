import AnswerOption from './AnswerOption'

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedIndex,
  correctIndex,
  revealed,
  onAnswer,
  disabled,
}) {
  if (!question) return null

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Question {questionIndex + 1} of {totalQuestions}</span>
        <span className="badge badge-purple">{question.difficulty || 'medium'}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question text */}
      <div className="card text-center py-8 px-6">
        <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <AnswerOption
            key={i}
            index={i}
            text={opt}
            disabled={disabled || revealed}
            selected={selectedIndex === i}
            correct={correctIndex === i}
            revealed={revealed}
            onClick={() => onAnswer?.(i)}
          />
        ))}
      </div>
    </div>
  )
}
