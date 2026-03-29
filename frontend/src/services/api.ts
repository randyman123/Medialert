import axios from 'axios'
import { tokenService } from './token.service'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = tokenService.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
