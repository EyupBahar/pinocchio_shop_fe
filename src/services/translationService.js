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

// Language code mapping
const languageMap = {
  de: 'de',
  en: 'en',
  fr: 'fr',
  it: 'it',
  tr: 'tr'
}

/**
 * Translate text using MyMemory (free, no API key required)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code
 * @returns {Promise<string>} Translated text
 */
const translateWithMyMemory = async (text, targetLang, sourceLang) => {
  try {
    const sourceCode = languageMap[sourceLang] || sourceLang
    const targetCode = languageMap[targetLang] || targetLang
    
    const response = await fetch(
      `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`
    )
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
    
    // Fallback to original text if translation failed
    return text
  } catch (error) {
    console.error('MyMemory translation error:', error)
    return text
  }
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

  // If no Google API key is configured, use MyMemory (free)
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return translateWithMyMemory(text, targetLang, sourceLang)
  }

  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: languageMap[targetLang] || targetLang,
          format: 'text'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data.translations[0].translatedText || text
  } catch (error) {
    console.error('Google Translate error, falling back to MyMemory:', error)
    // Fallback to MyMemory if Google Translate fails
    return translateWithMyMemory(text, targetLang, sourceLang)
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

  // If no Google API key is configured, use MyMemory (free)
  if (!GOOGLE_TRANSLATE_API_KEY) {
    // MyMemory doesn't support batch, so translate one by one
    const translatedTexts = await Promise.all(
      texts.map(text => translateWithMyMemory(text, targetLang, sourceLang))
    )
    return translatedTexts
  }

  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: texts,
          source: sourceLang,
          target: languageMap[targetLang] || targetLang,
          format: 'text'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data.translations.map(t => t.translatedText)
  } catch (error) {
    console.error('Google Translate error, falling back to MyMemory:', error)
    // Fallback to MyMemory if Google Translate fails
    const translatedTexts = await Promise.all(
      texts.map(text => translateWithMyMemory(text, targetLang, sourceLang))
    )
    return translatedTexts
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

