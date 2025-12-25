import apiClient from './api.js'

export const productFeatureService = {
  // Create new feature
  createFeature: (featureData) => {
    return apiClient.post('/Shop/ProductFeatures/CreateFeature', featureData)
  },

  // Create new substance for a feature
  createSubstance: (substanceData) => {
    return apiClient.post('/Shop/ProductFeatures/CreateSubstance', substanceData)
  },
}



