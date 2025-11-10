import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CategoryFilter } from '../components/CategoryFilter.jsx'
import { ProductCard } from '../components/ProductCard.jsx'
import { SortBar } from '../components/SortBar.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { productService } from '../services/productService.js'

export function ShopPage() {
  const { t } = useI18n()
  const location = useLocation()
  const [activeCategory, setActiveCategory] = useState('single')
  const [apiProducts, setApiProducts] = useState([])
  const [loading, setLoading] = useState(false)

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

  const filtered = useMemo(() => {
    if (activeCategory === 'all') {
      return apiProducts
    }
    
    // Kategori mapping'i
    const categoryMapping = {
      'single': ['1', 'single'],      // frontend single -> API'deki 1 veya single
      'combination': ['2', 'combination'] // frontend combination -> API'deki 2 veya combination
    }
    
    // API'den gelen ürünleri filtrele
    const filteredProducts = apiProducts.filter((p) => {
      const validApiIds = categoryMapping[activeCategory] || [activeCategory]
      const productCategoryRaw = p.categoryId ?? p.category ?? p.category_id
      const productCategory = productCategoryRaw != null ? String(productCategoryRaw).toLowerCase() : ''
      const matches = validApiIds.includes(productCategory)
      
      return matches
    })
    
    return filteredProducts
  }, [activeCategory, apiProducts])

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

      {!loading && pageItems.length === 0 && apiProducts.length === 0 && (
        <div style={{ marginTop: '2rem', color: '#666' }}>No products found</div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  )
}


