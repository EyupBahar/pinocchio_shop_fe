import apiClient from './api.js'

export const orderService = {
  // Create order
  createOrder: (orderData) => {
    return apiClient.post('/Shop/Orders/CreateOrder', orderData)
      .then(response => {
        return response
      })
      .catch(error => {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ orderService.createOrder error')
        console.error('Error status:', error?.response?.status)
        console.error('Error message:', error?.message)
        console.error('Error response data:', error?.response?.data)
        console.error('Request config:', {
          url: error?.config?.url,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          data: error?.config?.data
        })
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        throw error
      })
  },
  
  // Get order by ID
  getById: (orderId) => {
    return apiClient.get(`/Shop/Orders/${orderId}/GetDetail`)
  },
  
  // Update order
  updateOrder: (orderId, orderData) => {
    return apiClient.put(`/Shop/Orders/${orderId}/UpdateOrder`, orderData)
  },
  
  // Get all orders by filter
  getAllOrdersByFilter: (filters) => {
    return apiClient.post('/Shop/Orders/GetAllOrdersByFilter', filters)
  },
  
  // Get order details
  getOrderDetails: (orderId) => {
    return apiClient.get(`/Shop/Orders/OrderDetails/${orderId}`)
  },
  
  // Get user orders
  getUserOrders: (userId) => {
    const url = `/Shop/Orders/${userId}/GetUserOrders`
    return apiClient.get(url)
      .then(response => {
        return response
      })
      .catch(error => {
        console.error('❌ orderService.getUserOrders error:', error)
        console.error('Error URL:', error?.config?.url)
        console.error('Error status:', error?.response?.status)
        throw error
      })
  },
}

