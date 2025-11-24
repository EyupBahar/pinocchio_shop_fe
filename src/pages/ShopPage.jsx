import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CategoryFilter } from '../components/CategoryFilter.jsx'
import { ProductCard } from '../components/ProductCard.jsx'
import { SortBar } from '../components/SortBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { productService } from '../services/productService.js'
import { getLocalizedProducts } from '../utils/productI18n.js'
import { translateText, translateBatch, detectLanguage } from '../services/translationService.js'

export function ShopPage() {
  const { t, lang } = useI18n()
  const location = useLocation()
  const [activeCategory, setActiveCategory] = useState('single')
  const [apiProducts, setApiProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [translatedProducts, setTranslatedProducts] = useState([])
  const [translating, setTranslating] = useState(false)

  // Fetch products from API - refresh when location changes (e.g., after update)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await productService.getAll()
        
        // Try different response structures
        const productsData = response.data?.data || response.data || []
        setApiProducts(productsData)
      } catch (err) {
        console.error('❌ Error fetching products:', err)
        console.error('❌ Error details:', err.response)
        console.error('❌ Error message:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [location.pathname])

  // First, get products with backend translations
  const productsWithBackendTranslations = useMemo(() => {
    return getLocalizedProducts(apiProducts, lang)
  }, [apiProducts, lang])

  // Translate products that don't have backend translations
  useEffect(() => {
    if (apiProducts.length === 0) {
      setTranslatedProducts([])
      return
    }

    const translateProducts = async () => {
      // Find products that need translation (don't have backend translations)
      const productsNeedingTranslation = apiProducts
        .map((product, index) => {
          if (!product || !product.title) return null
          
          // Check if backend has translation for current language
          const hasBackendTranslation = !!product[`title_${lang}`]
          
          // If backend has translation, no need to translate
          if (hasBackendTranslation) return null
          
          return { original: product, localized: productsWithBackendTranslations[index] }
        })
        .filter(Boolean)

      // If no products need translation, use backend translations
      if (productsNeedingTranslation.length === 0) {
        setTranslatedProducts(productsWithBackendTranslations)
        return
      }

      console.log(`🔄 Translating ${productsNeedingTranslation.length} products to ${lang}`)
      setTranslating(true)

      try {
        // Detect source language from first product
        let sourceLang = 'tr'
        if (productsNeedingTranslation[0]?.original?.title) {
          try {
            const detected = await detectLanguage(productsNeedingTranslation[0].original.title)
            sourceLang = detected || 'tr'
            console.log('🌐 Detected source language:', sourceLang)
          } catch (err) {
            console.warn('⚠️ Language detection failed, using Turkish as default:', err)
            sourceLang = 'tr'
          }
        }

        // Don't translate if current language matches source
        if (lang === sourceLang) {
          setTranslatedProducts(productsWithBackendTranslations)
          setTranslating(false)
          return
        }

        // Translate all products in parallel (with rate limiting)
        const translationPromises = productsNeedingTranslation.map(async ({ original, localized }) => {
          const translated = { ...localized }
          
          try {
            // Translate title
            if (original.title) {
              translated.title = await translateText(original.title, lang, sourceLang)
            }
            
            // Translate description
            const originalDescription = original.description || original.features?.description || ''
            if (originalDescription) {
              translated.description = await translateText(originalDescription, lang, sourceLang)
            }
            
            // Translate features
            const originalProductFeatures = original.product_features || original.features?.product_features || []
            if (Array.isArray(originalProductFeatures) && originalProductFeatures.length > 0) {
              translated.product_features = await translateBatch(originalProductFeatures, lang, sourceLang)
            }
            
            const originalShipmentFeatures = original.shipment_features || original.features?.shipment_features || []
            if (Array.isArray(originalShipmentFeatures) && originalShipmentFeatures.length > 0) {
              translated.shipment_features = await translateBatch(originalShipmentFeatures, lang, sourceLang)
            }
            
            const originalDeliveryFeatures = original.delivery_features || original.features?.delivery_features || []
            if (Array.isArray(originalDeliveryFeatures) && originalDeliveryFeatures.length > 0) {
              translated.delivery_features = await translateBatch(originalDeliveryFeatures, lang, sourceLang)
            }
          } catch (err) {
            console.error(`Error translating product ${original.id}:`, err)
            // Keep original if translation fails
          }
          
          return { id: original.id, translated }
        })

        const translatedResults = await Promise.all(translationPromises)
        const translatedMap = new Map(translatedResults.map(({ id, translated }) => [id, translated]))
        
        // Merge translated products with products that have backend translations
        const finalProducts = productsWithBackendTranslations.map(product => {
          const translatedProduct = translatedMap.get(product.id)
          return translatedProduct || product
        })

        setTranslatedProducts(finalProducts)
      } catch (error) {
        console.error('Error translating products:', error)
        setTranslatedProducts(productsWithBackendTranslations)
      } finally {
        setTranslating(false)
      }
    }

    translateProducts()
  }, [productsWithBackendTranslations, lang, apiProducts])

  // Use translated products if available, otherwise use backend translations
  const localizedProducts = translatedProducts.length > 0 ? translatedProducts : productsWithBackendTranslations

  const filtered = useMemo(() => {
    if (activeCategory === 'all') {
      return localizedProducts
    }
    
    // Kategori mapping'i
    const categoryMapping = {
      'single': ['1', 'single'],      // frontend single -> API'deki 1 veya single
      'combination': ['2', 'combination'] // frontend combination -> API'deki 2 veya combination
    }
    
    // API'den gelen ürünleri filtrele
    const filteredProducts = localizedProducts.filter((p) => {
      const validApiIds = categoryMapping[activeCategory] || [activeCategory]
      const productCategoryRaw = p.categoryId ?? p.category ?? p.category_id
      const productCategory = productCategoryRaw != null ? String(productCategoryRaw).toLowerCase() : ''
      const matches = validApiIds.includes(productCategory)
      
      return matches
    })
    
    return filteredProducts
  }, [activeCategory, localizedProducts])

  const [sort, setSort] = useState('featured')
  const sorted = useMemo(() => {
    if (sort === 'price-asc') return [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'price-desc') return [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
    return filtered
  }, [filtered, sort])

  const [page, setPage] = useState(1)
  const perPage = 6
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const pageItems = useMemo(() => sorted.slice((page - 1) * perPage, page * perPage), [sorted, page])

  // Always show two categories: Einzelstücke (single) and Geschenksets (combination)
  const categories = useMemo(() => (
    [
      { id: 'single', nameKey: 'singleProduct' },
      { id: 'combination', nameKey: 'combination' }
    ]
  ), [])

  return (
    <div className="container section" style={{ paddingBottom: '2rem' }}>
      <div className="section-title">
        <h2 className='shop-title'>{t('shop')}</h2>
        <SortBar sort={sort} setSort={(v) => { setPage(1); setSort(v) }} />
      </div>
      {categories.length > 0 && (
        <CategoryFilter categories={categories} activeId={activeCategory} onChange={(id) => { setPage(1); setActiveCategory(id) }} />
      )}

      {loading && <div style={{ marginTop: '2rem' }}>Loading products...</div>}
      
      {!loading && pageItems.length > 0 && (
        <div className="grid-products" style={{ marginTop: '1.5rem' }}>
          {pageItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!loading && pageItems.length === 0 && localizedProducts.length === 0 && (
        <div style={{ marginTop: '2rem', color: '#666' }}>No products found</div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  )
}


