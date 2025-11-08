import apiClient from './api.js'

export const authService = {
  register: (payload) => {
    // payload: { firstName, lastName, email, phone, password }
    return apiClient.post('/auth/register', payload)
  },
  login: (payload) => {
    // payload: { email, password }
    return apiClient.post('/auth/login', payload)
  },
  getProfile: (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return apiClient.get('/users/getProfile', { headers })
  }
}


