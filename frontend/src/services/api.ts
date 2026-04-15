import axios from 'axios'
import { tokenService } from './token.service'

const LOCAL_API_URL = 'http://localhost:3000'

function resolveApiUrl() {
  const envApiUrl = import.meta.env.VITE_API_URL?.trim()

  if (!envApiUrl) {
    return LOCAL_API_URL
  }

  return envApiUrl.replace(/\/+$/, '')
}

export const api = axios.create({
  baseURL: resolveApiUrl(),
})

api.interceptors.request.use((config) => {
  const token = tokenService.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
