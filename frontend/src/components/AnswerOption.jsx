const SHAPES = ['▲', '◆', '●', '■']
const BG_CLASSES = [
  'bg-red-500 hover:bg-red-600 border-red-600',
  'bg-blue-500 hover:bg-blue-600 border-blue-600',
  'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
  'bg-emerald-500 hover:bg-emerald-600 border-emerald-600',
]

/**
 * @param {object} props
 * @param {number}  props.index        - 0-3
 * @param {string}  props.text
 * @param {boolean} props.disabled
 * @param {boolean} props.selected     - participant chose this
 * @param {boolean} props.correct      - this is the correct answer (shown after reveal)
 * @param {boolean} props.revealed     - show correct/incorrect state
 * @param {function} props.onClick
 */
export default function AnswerOption({ index, text, disabled, selected, correct, revealed, onClick }) {
  let extra = ''
  if (revealed) {
    if (correct)                    extra = 'ring-4 ring-white scale-105 brightness-110'
    else if (selected && !correct)  extra = 'opacity-60 line-through'
    else                            extra = 'opacity-40'
  } else if (selected) {
    extra = 'ring-4 ring-white scale-105'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Option ${index + 1}: ${text}`}
      className={`
        relative w-full flex items-center gap-3 px-5 py-4 rounded-2xl
        text-white font-bold text-left text-sm sm:text-base
        border-b-4 transition-all duration-200 active:scale-95
        disabled:cursor-not-allowed
        ${BG_CLASSES[index]} ${extra}
      `}
    >
      <span className="text-xl opacity-80">{SHAPES[index]}</span>
      <span className="flex-1 leading-snug">{text}</span>
      {revealed && correct && <span className="text-xl">✓</span>}
      {revealed && selected && !correct && <span className="text-xl">✗</span>}
    </button>
  )
}
