import apiClient from './api.js'

// Note: Token handling is done automatically by apiClient interceptor
// No need to manually add Authorization headers here

export const productService = {
  // Get all products
  // Note: Authorization header is automatically added by apiClient interceptor
  getAll: () => {
    return apiClient.get('/Shop/Products/GetAll')
  },

  // Get product by ID
  // Note: Authorization header is automatically added by apiClient interceptor
  getById: (id) => {
    return apiClient.get(`/Shop/Products/${id}/GetDetail`)
  },

  // Create product
  // Note: Authorization header is automatically added by apiClient interceptor
  create: (productData) => {
    return apiClient.post('/Shop/Products/Create', productData)
  },

  // Update product
  // Note: Authorization header is automatically added by apiClient interceptor
  update: (id, productData) => {
    return apiClient.put(`/Shop/Products/${id}/Update`, productData)
  },

  // Delete product
  // Note: Authorization header is automatically added by apiClient interceptor
  delete: (id) => {
    return apiClient.delete(`/Shop/Products/${id}/Delete`)
  },
}

