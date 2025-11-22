import apiClient from './api.js'

export const userService = {
  // Get user profile (current logged in user)
  getProfile: () => {
    return apiClient.get('/users/getProfile')
  },

  // Get user by ID
  getById: (id) => {
    return apiClient.get(`/users/${id}`)
  },

  // Update user
  update: (id, userData) => {
    return apiClient.put(`/users/update/${id}`, userData)
  },

  // Get all users (for admin)
  getAll: () => {
    return apiClient.get('/users')
  },

  // Delete user (for admin)
  delete: (id) => {
    return apiClient.delete(`/users/${id}`)
  }
}

