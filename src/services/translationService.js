/**
 * Translation Service
 * 
 * This service provides translation functionality for product content.
 * Supports multiple translation providers:
 * 1. Google Translate API (requires API key)
 * 2. MyMemory Translation API (free, no API key required)
 * 
 * To use Google Translate API:
 * 1. Get an API key from Google Cloud Console
 * 2. Enable Cloud Translation API
 * 3. Set VITE_GOOGLE_TRANSLATE_API_KEY in your .env file
 * 
 * If no Google API key is provided, MyMemory (free) will be used automatically.
 */

const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get'

// Rate limiting for MyMemory API (free tier has strict limits: ~100 requests/day)
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 5000 // 5 seconds between requests to avoid 429 errors (increased)
const requestQueue = []
let isProcessingQueue = false
let consecutive429Errors = 0
let isRateLimited = false // Global rate limit flag

// Process request queue with rate limiting
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return
  
  isProcessingQueue = true
  
  while (requestQueue.length > 0) {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
    }
    
    const { resolve, reject, requestFn } = requestQueue.shift()
    lastRequestTime = Date.now()
    
    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    }
  }
  
  isProcessingQueue = false
}

// Add request to queue with rate limiting
const queueRequest = (requestFn) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, requestFn })
    processRequestQueue()
  })
}

// Language code mapping
const languageMap = {
  de: 'de',
  en: 'en',
  fr: 'fr',
  it: 'it',
  tr: 'tr',
  ar: 'ar' // Arabic
}

/**
 * Translate text using MyMemory (free, no API key required)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code
 * @returns {Promise<string>} Translated text
 */
const translateWithMyMemory = async (text, targetLang, sourceLang) => {
  // If rate limited, return original text immediately
  if (isRateLimited) {
    console.warn('⚠️ MyMemory API is rate limited. Returning original text.')
    return text
  }
  
  const sourceCode = languageMap[sourceLang] || sourceLang
  const targetCode = languageMap[targetLang] || targetLang
  
  // MyMemory API format: ar|en (source|target)
  const langPair = `${sourceCode}|${targetCode}`
  
  // Use rate-limited request queue
  return queueRequest(async () => {
    try {
      const response = await fetch(
        `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`
      )
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded - set global flag and return original
          isRateLimited = true
          consecutive429Errors++
          console.error('❌ MyMemory API rate limit exceeded. Translation disabled.')
          console.error('💡 To enable translations, add VITE_GOOGLE_TRANSLATE_API_KEY to your .env file')
          console.error('💡 Or add translations via AddProductPage (backend translations)')
          
          // Reset rate limit flag after 1 hour
          setTimeout(() => {
            isRateLimited = false
            consecutive429Errors = 0
            console.log('✅ MyMemory rate limit reset. Translations enabled again.')
          }, 60 * 60 * 1000) // 1 hour
          
          return text
        }
        throw new Error(`MyMemory API error: ${response.status}`)
      }
      
      // Reset error counter on success
      consecutive429Errors = 0
      
      const data = await response.json()
      
      // Check if translation was successful
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText
        // Sometimes MyMemory returns the same text if translation fails
        // Check if it's actually different
        if (translated && translated.trim() !== text.trim()) {
          return translated
        }
      }
      
      // If translation failed or returned same text, log and return original
      console.warn(`MyMemory translation may have failed for ${langPair}. Response:`, data)
      return text
    } catch (error) {
      console.error('MyMemory translation error:', error)
      console.error('Source:', sourceLang, 'Target:', targetLang)
      return text
    }
  })
}

/**
 * Translate text using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (de, en, fr, it)
 * @param {string} sourceLang - Source language code (default: 'tr' for Turkish)
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLang = 'en', sourceLang = 'tr') => {
  if (!text || !text.trim()) {
    return text
  }

  // If target language is the same as source, return original text
  if (targetLang === sourceLang) {
    return text
  }

  // If no Google API key is configured, return original text (don't use MyMemory to avoid rate limits)
  if (!GOOGLE_TRANSLATE_API_KEY) {
    // MyMemory has strict rate limits, so we don't use it for runtime translation
    // Return original text instead
    if (import.meta.env.DEV) {
      console.warn('⚠️ No Google Translate API key. Returning original text. Add VITE_GOOGLE_TRANSLATE_API_KEY to enable translation.')
    }
    return text
  }

  try {
    // Google Translate API: Let API auto-detect source language for better accuracy
    // This works especially well for Arabic and other languages
    const requestBody = {
      q: text,
      target: languageMap[targetLang] || targetLang,
      format: 'text'
    }
    
    // Only specify source if it's a known language (not auto-detected)
    // For unknown languages or when we want auto-detection, omit source
    if (sourceLang && languageMap[sourceLang]) {
      requestBody.source = languageMap[sourceLang]
    }
    
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data.translations[0].translatedText || text
  } catch (error) {
    console.error('Google Translate error:', error)
    // Return original text instead of falling back to MyMemory (to avoid rate limits)
    return text
  }
}

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code
 * @returns {Promise<string[]>} Array of translated texts
 */
export const translateBatch = async (texts, targetLang = 'en', sourceLang = 'tr') => {
  if (!texts || texts.length === 0) {
    return texts
  }

  // If target language is the same as source, return original texts
  if (targetLang === sourceLang) {
    return texts
  }

  // If no Google API key is configured, return original texts (don't use MyMemory to avoid rate limits)
  if (!GOOGLE_TRANSLATE_API_KEY) {
    // MyMemory has strict rate limits, so we don't use it for runtime translation
    // Return original texts instead
    if (import.meta.env.DEV) {
      console.warn('⚠️ No Google Translate API key. Returning original texts. Add VITE_GOOGLE_TRANSLATE_API_KEY to enable translation.')
    }
    return texts
  }

  try {
    // Google Translate API: Let API auto-detect source language for better accuracy
    const requestBody = {
      q: texts,
      target: languageMap[targetLang] || targetLang,
      format: 'text'
    }
    
    // Only specify source if it's a known language
    if (sourceLang && languageMap[sourceLang]) {
      requestBody.source = languageMap[sourceLang]
    }
    
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data.translations.map(t => t.translatedText)
  } catch (error) {
    console.error('Google Translate error:', error)
    // Return original texts instead of falling back to MyMemory (to avoid rate limits)
    return texts
  }
}

/**
 * Detect language of text
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} Detected language code
 */
export const detectLanguage = async (text) => {
  if (!text || !text.trim()) {
    return 'tr'
  }

  if (!GOOGLE_TRANSLATE_API_KEY) {
    return 'tr' // Default to Turkish if no API key
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data.detections[0][0].language || 'tr'
  } catch (error) {
    console.error('Language detection error:', error)
    return 'tr' // Default to Turkish on error
  }
}

