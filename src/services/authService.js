import apiClient from './api.js'

export const authService = {
  register: (payload) => {
    // payload: { firstName, lastName, email, phone, password }
    // Note: No auth token needed for registration
    return apiClient.post('/auth/register', payload)
  },
  login: (payload) => {
    // payload: { email, password }
    // Note: No auth token needed for login
    return apiClient.post('/auth/login', payload)
  },
  getProfile: (token) => {
    // Note: If token is provided, it will be used, otherwise apiClient interceptor will try to get it from cookie/localStorage
    // For explicit token usage, we can pass it via headers, but interceptor handles it automatically
    if (token) {
      // If explicit token provided, use it
      return apiClient.get('/users/getProfile', {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    // Otherwise, let interceptor handle it
    return apiClient.get('/users/getProfile')
  }
}


