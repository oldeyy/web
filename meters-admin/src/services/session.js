/**
 * Хранение сессии администратора: JWT и данные пользователя.
 * «Запомнить меня» — localStorage (сессия переживает закрытие браузера),
 * иначе sessionStorage (сессия живёт до закрытия вкладки).
 */

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

/** Хранилище, в котором сейчас лежит токен (или null). */
function currentStorage() {
  if (localStorage.getItem(TOKEN_KEY)) return localStorage
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage
  return null
}

export function loadSession() {
  const storage = currentStorage()
  if (!storage) return { token: null, user: null, remember: false }
  return {
    token: storage.getItem(TOKEN_KEY),
    user: JSON.parse(storage.getItem(USER_KEY) || 'null'),
    remember: storage === localStorage,
  }
}

export function saveSession(token, user, remember) {
  clearSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

/** Обновляет данные пользователя, не меняя место хранения. */
export function updateSessionUser(user) {
  currentStorage()?.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
  }
}

export function getToken() {
  return currentStorage()?.getItem(TOKEN_KEY) ?? null
}

/**
 * Полезная нагрузка JWT (вторая часть токена, base64url → JSON).
 * Подпись на клиенте не проверяется — это делает сервер; здесь нужны только exp, name, role.
 */
export function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Момент истечения токена в миллисекундах (или null, если срок не указан). */
export function tokenExpiresAt(token) {
  const exp = decodeJwt(token)?.exp
  return exp ? exp * 1000 : null
}
