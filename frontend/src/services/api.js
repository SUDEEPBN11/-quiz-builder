import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'Network error. Please check your connection.'
    const code =
      err.response?.data?.error?.code || 'REQUEST_ERROR'
    const status = err.response?.status || 0
    const normalized = new Error(message)
    normalized.code = code
    normalized.status = status
    return Promise.reject(normalized)
  }
)

export const createSession = (presenterName) =>
  api.post('/sessions', { presenterName }).then((r) => r.data)

export const getSession = (code) =>
  api.get(`/sessions/${code}`).then((r) => r.data)

export const updateSessionStatus = (sessionId, status, presenterToken) =>
  api.patch(`/sessions/${sessionId}/status`, { status, presenterToken }).then((r) => r.data)

export const joinSession = (code, displayName) =>
  api.post(`/sessions/${code}/join`, { displayName }).then((r) => r.data)

export const getParticipantSummary = (sessionId, participantId, participantToken) =>
  api
    .get(`/sessions/${sessionId}/participants/${participantId}/summary`, {
      params: { participantToken },
    })
    .then((r) => r.data)

export const addQuestion = (sessionId, presenterToken, questionData) =>
  api.post(`/sessions/${sessionId}/questions`, { presenterToken, ...questionData }).then((r) => r.data)

export const editQuestion = (sessionId, presenterToken, index, questionData) =>
  api.put(`/sessions/${sessionId}/questions/${index}`, { presenterToken, ...questionData }).then((r) => r.data)

export const deleteQuestion = (sessionId, presenterToken, index) =>
  api.delete(`/sessions/${sessionId}/questions/${index}`, { data: { presenterToken } }).then((r) => r.data)

export const generateAIQuestions = (presenterToken, topic, difficulty, count, provider) =>
  api.post('/ai/generate', { presenterToken, topic, difficulty, count, provider }).then((r) => r.data)

export const uploadPPTX = (presenterToken, file, count, difficulty, provider) => {
  const form = new FormData()
  form.append('file', file)
  form.append('presenterToken', presenterToken)
  form.append('count', count)
  form.append('difficulty', difficulty)
  if (provider) form.append('provider', provider)
  return api.post('/pptx/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}

export const getAnalytics = (sessionId, presenterToken) =>
  api.get(`/sessions/${sessionId}/analytics`, { params: { presenterToken } }).then((r) => r.data)

export const getLeaderboard = (sessionId) =>
  api.get(`/sessions/${sessionId}/leaderboard`).then((r) => r.data)

export default api
