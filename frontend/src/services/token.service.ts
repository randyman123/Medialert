const TOKEN_KEY = 'medialert_token'
const USER_NAME_KEY = 'medialert_user_name'

export const tokenService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_NAME_KEY)
  },
  getUserName() {
    return localStorage.getItem(USER_NAME_KEY)
  },
  setUserName(userName: string) {
    localStorage.setItem(USER_NAME_KEY, userName)
  },
}
