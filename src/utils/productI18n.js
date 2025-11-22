/**
 * Product i18n Helper
 * 
 * This utility helps display product data in the selected language.
 * Supports two scenarios:
 * 1. Backend returns multilingual data (title_de, title_en, title_fr, title_it)
 * 2. Backend returns single language data (title) - will use original
 * 
 * Usage:
 * import { getLocalizedProduct } from '../utils/productI18n'
 * const localizedProduct = getLocalizedProduct(product, lang)
 */

/**
 * Get localized product field value
 * @param {Object} product - Product object from backend
 * @param {string} field - Field name (e.g., 'title', 'description')
 * @param {string} lang - Current language code (de, en, fr, it)
 * @returns {string} Localized field value or original if not found
 */
export const getLocalizedField = (product, field, lang) => {
  if (!product) return ''
  
  // Try to get localized field (e.g., title_de, title_en, title_fr, title_it)
  const localizedField = `${field}_${lang}`
  if (product[localizedField]) {
    return product[localizedField]
  }
  
  // Fallback to original field
  if (product[field]) {
    return product[field]
  }
  
  return ''
}

/**
 * Get localized product object with all fields translated
 * @param {Object} product - Product object from backend
 * @param {string} lang - Current language code (de, en, fr, it)
 * @returns {Object} Product object with localized fields
 */
export const getLocalizedProduct = (product, lang) => {
  if (!product) return null
  
  // Create a new object with localized fields
  const localized = { ...product }
  
  // Fields that might be multilingual
  const translatableFields = [
    'title',
    'description',
    'deliveryTime'
  ]
  
  // Replace each field with localized version if available
  translatableFields.forEach(field => {
    const localizedValue = getLocalizedField(product, field, lang)
    if (localizedValue) {
      localized[field] = localizedValue
    }
  })
  
  // Handle features arrays (product_features, shipment_features, delivery_features)
  // These might be arrays of strings or objects with language fields
  const featureFields = ['product_features', 'shipment_features', 'delivery_features']
  featureFields.forEach(featureField => {
    const features = product[featureField] || product.features?.[featureField] || []
    if (Array.isArray(features) && features.length > 0) {
      // Check if features are objects with language fields
      if (typeof features[0] === 'object' && features[0] !== null) {
        // Features are objects, try to get localized version
        localized[featureField] = features.map(feature => {
          const localizedFeature = getLocalizedField(feature, 'text', lang) || 
                                   getLocalizedField(feature, 'name', lang) ||
                                   feature.text || feature.name || feature
          return typeof localizedFeature === 'string' ? localizedFeature : feature
        })
      } else {
        // Features are strings, check if there are localized versions
        const localizedFeatures = features.map((feature, index) => {
          const localizedFeatureField = `${featureField}_${lang}`
          if (product[localizedFeatureField] && Array.isArray(product[localizedFeatureField])) {
            return product[localizedFeatureField][index] || feature
          }
          return feature
        })
        localized[featureField] = localizedFeatures
      }
    }
  })
  
  return localized
}

/**
 * Get localized products array
 * @param {Array} products - Array of product objects from backend
 * @param {string} lang - Current language code (de, en, fr, it)
 * @returns {Array} Array of localized product objects
 */
export const getLocalizedProducts = (products, lang) => {
  if (!Array.isArray(products)) return []
  return products.map(product => getLocalizedProduct(product, lang))
}

