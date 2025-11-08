import apiClient from './api.js'

function getTokenFromCookie(name = 'authToken') {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  for (const c of cookies) {
    const [k, v] = c.split('=')
    if (k === name) return decodeURIComponent(v)
  }
  return null
}

export const productService = {
  // Get all products
  getAll: () => {
    const token = getTokenFromCookie('authToken') || localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return apiClient.get('/Shop/Products/GetAll', { headers })
  },

  // Get product by ID
  getById: (id) => {
    const token = getTokenFromCookie('authToken') || localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return apiClient.get(`/Shop/Products/${id}/GetDetail`, { headers })
  },

  // Create product
  create: (productData) => {
    return apiClient.post('/Shop/Products/Create', productData)
  },

  // Update product
  update: (id, productData) => {
    return apiClient.put(`/Shop/Products/${id}/Update`, productData)
  },

  // Delete product
  delete: (id) => {
    const token = getTokenFromCookie('authToken') || localStorage.getItem('authToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return apiClient.delete(`/Shop/Products/${id}/Delete`, { headers })
  },
}

