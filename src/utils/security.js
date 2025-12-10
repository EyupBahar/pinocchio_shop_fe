/**
 * Security Utilities
 * XSS protection, input sanitization, and security helpers
 */

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input
  }
  
  // Remove potentially dangerous characters and HTML tags
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
    .trim()
}

/**
 * Sanitize object with string values recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Clear sensitive data from memory
 * @param {object} data - Data object to clear
 */
export const clearSensitiveData = (data) => {
  if (!data || typeof data !== 'object') {
    return
  }
  
  // Clear password fields
  if (data.password) {
    data.password = ''
  }
  if (data.confirmPassword) {
    data.confirmPassword = ''
  }
  if (data.token) {
    data.token = ''
  }
  if (data.authToken) {
    data.authToken = ''
  }
  
  // Clear nested objects
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'object' && data[key] !== null) {
      clearSensitiveData(data[key])
    }
  })
}

/**
 * Rate limiting helper
 */
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }
  
  canMakeRequest(key) {
    const now = Date.now()
    const userRequests = this.requests.get(key) || []
    
    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs)
    
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    recentRequests.push(now)
    this.requests.set(key, recentRequests)
    return true
  }
  
  reset(key) {
    this.requests.delete(key)
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(5, 60000) // 5 requests per minute

/**
 * Debounce function to prevent rapid API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if running in production and enforce HTTPS
 */
export const enforceHTTPS = () => {
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.error('⚠️ HTTPS is required in production')
      window.location.href = window.location.href.replace('http:', 'https:')
    }
  }
}

