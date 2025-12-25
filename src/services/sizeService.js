import apiClient from './api.js'

export const sizeService = {
  // Get all sizes
  getAllSizes: () => {
    return apiClient.get('/Shop/Sizes/GetAllSizes')
  },

  // Create new size
  create: (sizeData) => {
    return apiClient.post('/Shop/Sizes/CreateSize', sizeData)
  },

  // Create new size scale type
  createSizeScaleType: (scaleTypeData) => {
    return apiClient.post('/Shop/Sizes/CreateSizeScaleType', scaleTypeData)
  },
}

