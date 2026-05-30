import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b']

export function QuestionStatsChart({ questionStats = [] }) {
  const data = questionStats.map((s) => ({
    name: `Q${s.questionIndex + 1}`,
    Correct:   s.correct,
    Incorrect: s.incorrect,
    Skipped:   s.skipped,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Correct"   fill="#10b981" radius={[4,4,0,0]} />
        <Bar dataKey="Incorrect" fill="#1b271bff" radius={[4,4,0,0]} />
        <Bar dataKey="Skipped"   fill="#f59e0b" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AccuracyPieChart({ accuracy = 0 }) {
  const data = [
    { name: 'Correct',   value: accuracy },
    { name: 'Incorrect', value: 100 - accuracy },
  ]

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={50} outerRadius={75}
            paddingAngle={3} dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 -mt-4">
        {accuracy}%
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">Overall Accuracy</p>
    </div>
  )
}
