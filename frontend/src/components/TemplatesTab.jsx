import { useState } from 'react'

const TEMPLATES = [
  {
    id: 'general-knowledge',
    title: 'General Knowledge',
    emoji: '🌍',
    description: '5 classic trivia questions covering geography, science, and history.',
    questions: [
      {
        text: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'How many planets are in our Solar System?',
        options: ['7', '8', '9', '10'],
        correctIndex: 1,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'Which element has the chemical symbol "O"?',
        options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
        correctIndex: 1,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctIndex: 2,
        difficulty: 'medium',
        timerSeconds: 25,
      },
      {
        text: 'What is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctIndex: 3,
        difficulty: 'easy',
        timerSeconds: 20,
      },
    ],
  },
  {
    id: 'science-tech',
    title: 'Science & Technology',
    emoji: '🔬',
    description: '5 questions on physics, biology, and modern technology.',
    questions: [
      {
        text: 'What does CPU stand for?',
        options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'],
        correctIndex: 0,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'What is the approximate speed of light in a vacuum?',
        options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '1,000,000 km/s'],
        correctIndex: 0,
        difficulty: 'medium',
        timerSeconds: 25,
      },
      {
        text: 'Which gas do plants absorb during photosynthesis?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'What programming language is primarily used for web styling?',
        options: ['JavaScript', 'Python', 'CSS', 'HTML'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
    ],
  },
  {
    id: 'history',
    title: 'World History',
    emoji: '🏛️',
    description: '5 questions spanning ancient civilizations to modern events.',
    questions: [
      {
        text: 'Who was the first President of the United States?',
        options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'The Great Wall of China was primarily built to protect against which group?',
        options: ['Mongols', 'Japanese', 'Persians', 'Romans'],
        correctIndex: 0,
        difficulty: 'medium',
        timerSeconds: 25,
      },
      {
        text: 'In which year did the Berlin Wall fall?',
        options: ['1987', '1988', '1989', '1991'],
        correctIndex: 2,
        difficulty: 'medium',
        timerSeconds: 25,
      },
      {
        text: 'Which ancient wonder was located in Alexandria, Egypt?',
        options: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Temple of Artemis'],
        correctIndex: 1,
        difficulty: 'medium',
        timerSeconds: 30,
      },
      {
        text: 'Who delivered the "I Have a Dream" speech?',
        options: ['Malcolm X', 'Barack Obama', 'Martin Luther King Jr.', 'John F. Kennedy'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
    ],
  },
  {
    id: 'pop-culture',
    title: 'Pop Culture',
    emoji: '🎬',
    description: '5 fun questions about movies, music, and entertainment.',
    questions: [
      {
        text: 'Which movie features the quote "May the Force be with you"?',
        options: ['Star Trek', 'Star Wars', 'Interstellar', 'The Matrix'],
        correctIndex: 1,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'Which band performed "Bohemian Rhapsody"?',
        options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: "In the TV show Friends, what is the name of Ross's pet monkey?",
        options: ['Marcel', 'Bubbles', 'Coco', 'Spike'],
        correctIndex: 0,
        difficulty: 'medium',
        timerSeconds: 25,
      },
      {
        text: 'Which superhero is known as the "Man of Steel"?',
        options: ['Batman', 'Iron Man', 'Thor', 'Superman'],
        correctIndex: 3,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'Who directed the movie Titanic (1997)?',
        options: ['Steven Spielberg', 'James Cameron', 'Christopher Nolan', 'Ridley Scott'],
        correctIndex: 1,
        difficulty: 'easy',
        timerSeconds: 20,
      },
    ],
  },
  {
    id: 'math-logic',
    title: 'Math & Logic',
    emoji: '🧮',
    description: '5 brain-teasing questions on numbers, patterns, and logic.',
    questions: [
      {
        text: 'What is the value of π (pi) to two decimal places?',
        options: ['3.12', '3.14', '3.16', '3.18'],
        correctIndex: 1,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'What is the square root of 144?',
        options: ['10', '11', '12', '13'],
        correctIndex: 2,
        difficulty: 'easy',
        timerSeconds: 20,
      },
      {
        text: 'If a train travels at 60 km/h for 2.5 hours, how far does it travel?',
        options: ['120 km', '130 km', '150 km', '160 km'],
        correctIndex: 2,
        difficulty: 'medium',
        timerSeconds: 30,
      },
      {
        text: 'What is the next number in the sequence: 1, 1, 2, 3, 5, 8, ?',
        options: ['11', '12', '13', '14'],
        correctIndex: 2,
        difficulty: 'medium',
        timerSeconds: 25,
      },
      {
        text: 'How many sides does a hexagon have?',
        options: ['5', '6', '7', '8'],
        correctIndex: 1,
        difficulty: 'easy',
        timerSeconds: 20,
      },
    ],
  },
]

const DIFFICULTY_COLOR = {
  easy:   'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  hard:   'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
}

export default function TemplatesTab({ onAddAll, loading }) {
  const [expanded, setExpanded] = useState(null)
  const [added,    setAdded]    = useState({})

  const handleUse = async (template) => {
    await onAddAll(template.questions)
    setAdded((prev) => ({ ...prev, [template.id]: true }))
  }

  return (
    <div className="flex flex-col gap-3">
      {TEMPLATES.map((tpl) => (
        <div key={tpl.id} className="card overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tpl.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{tpl.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tpl.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setExpanded(expanded === tpl.id ? null : tpl.id)}
                className="btn-ghost btn-sm text-xs"
              >
                {expanded === tpl.id ? 'Hide ▲' : 'Preview ▼'}
              </button>
              <button
                onClick={() => handleUse(tpl)}
                disabled={loading || added[tpl.id]}
                className={`btn-sm px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  added[tpl.id]
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-default'
                    : 'btn-primary'
                }`}
              >
                {added[tpl.id] ? '✓ Added' : loading ? 'Adding…' : 'Use Template'}
              </button>
            </div>
          </div>

          {/* Expandable question preview */}
          {expanded === tpl.id && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
              {tpl.questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <span className="w-5 h-5 rounded-md bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{q.text}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {q.options.map((opt, oi) => (
                        <span
                          key={oi}
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            oi === q.correctIndex
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'bg-slate-100 dark:bg-slate-600/50 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {oi === q.correctIndex ? '✓ ' : ''}{opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${DIFFICULTY_COLOR[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
