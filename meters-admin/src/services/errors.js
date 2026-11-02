/**
 * Текст ошибки из ответа API.
 * REST API возвращает { error, fields? }, mock-адаптер — { message }.
 * Для ошибок валидации (422) к тексту добавляются сообщения по полям.
 */
export function apiErrorMessage(err, fallback = 'Не удалось выполнить запрос') {
  const data = err.response?.data
  if (!err.response) return 'Сервер API недоступен'
  const text = data?.error || data?.message || fallback
  const fields = data?.fields ? Object.values(data.fields).join('; ') : ''
  return fields ? `${text}: ${fields}` : text
}
