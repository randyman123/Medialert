const TOKEN_KEY = 'medialert_token'

export const tokenService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
  },
}
