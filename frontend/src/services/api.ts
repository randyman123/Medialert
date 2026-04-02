import axios from 'axios'
import { tokenService } from './token.service'

const apiUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000'

export const api = axios.create({
  baseURL: apiUrl,
})

api.interceptors.request.use((config) => {
  const token = tokenService.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
