import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useCart } from '../contexts/CartContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { productService } from '../services/productService.js'
import { StarRating } from './StarRating.jsx'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function ProductCard({ product }) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const inCart = items.find((i) => i.id === product.id)
  const [transformOrigin, setTransformOrigin] = useState('50% 50%')
  const imgRef = useRef(null)
  const [swiperInstance, setSwiperInstance] = useState(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Prepare images array (main image + additional images)
  const mainImage = product.image || product.imageUrl || product.picture
  const additionalImages = product.images || []
  const allImages = [mainImage, ...additionalImages].filter(Boolean)

  const handleMouseMove = (e) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setTransformOrigin(`${x}% ${y}%`)
  }

  const handleMouseLeave = () => {
    setTransformOrigin('50% 50%')
  }

  function onAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    const variantId = product.variants?.[0]?.id || 'std'
    addItem(product, variantId, 1)
  }

  function onIncrease(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!inCart) return
    updateQuantity(inCart.id, inCart.variantId, inCart.quantity + 1)
  }

  function onDecrease(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!inCart) return
    if (inCart.quantity > 1) {
      updateQuantity(inCart.id, inCart.variantId, inCart.quantity - 1)
    } else {
      // Eğer miktar 1 ise, ürünü sepetten çıkar
      removeItem(inCart.id, inCart.variantId)
    }
  }

  function onDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!inCart) return
    removeItem(inCart.id, inCart.variantId)
  }

  async function handleProductDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(product.id)
        window.location.reload()
      } catch (err) {
        console.error('Error deleting product:', err)
        alert('Failed to delete product')
      }
    }
  }

  function handleProductEdit(e) {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/add-product/${product.id}`)
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {product.promo && (<span className="badge-red">{t('action')}</span>)}
        {inCart && (<span className="badge-count">x{inCart.quantity}</span>)}
        
        {user && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            display: 'flex',
            gap: '0.25rem',
            zIndex: 10
          }}>
            <button
              onClick={handleProductEdit}
              style={{
                background: '#9B724C',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Edit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={handleProductDelete}
              style={{
                background: '#dc2626',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        )}
      {allImages.length > 1 ? (
        <div
          onClick={(e) => {
            // Son slide'da tıklanırsa detay sayfasına git
            if (currentSlideIndex === allImages.length - 1) {
              e.preventDefault()
              e.stopPropagation()
              navigate(`/product/${product.id}`)
            }
          }}
          style={{ cursor: currentSlideIndex === allImages.length - 1 ? 'pointer' : 'default' }}
        >
          <Swiper
            onSwiper={setSwiperInstance}
            spaceBetween={0}
            navigation={true}
            pagination={{ clickable: true, dynamicBullets: true }}
            loop={true}
            modules={[Navigation, Pagination]}
            className="card-image-swiper"
            style={{
              width: '100%',
              height: '14rem'
            }}
            onSlideChange={(swiper) => {
              setCurrentSlideIndex(swiper.realIndex)
            }}
          >
            {allImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`${product.title} - ${index + 1}`}
                  className="card-image"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '14rem',
                    objectFit: 'cover',
                    display: 'block',
                    transformOrigin: 'center'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lrmoVDM2ATvfF3ervXOmT65AGCZf28L4gg&s'
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <img 
          ref={imgRef}
          src={mainImage} 
          alt={product.title} 
          className="card-image" 
          loading="lazy" 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transformOrigin }}
          onError={(e) => { e.currentTarget.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lrmoVDM2ATvfF3ervXOmT65AGCZf28L4gg&s'; }} 
        />
      )}
      <div className="card-body" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '180px'
      }}>
        <div className="card-title" style={{ fontSize: "clamp(1rem, 3vw, 1.35rem)", fontWeight: 700 }}>{product.title}</div>
        <div style={{ 
          margin: '0.5rem 0',
          height: '24px',
          minHeight: '24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {product.rating && product.rating > 0 ? (
            <StarRating rating={product.rating} size="small" />
          ) : (
            <div style={{ height: '24px', width: '100%' }}></div>
          )}
        </div>
        <div className="card-sub" style={{ marginTop: '0.25rem' }}>{t('priceFrom')} {Number(product.price).toFixed(2)}</div>
        <div className="card-row" style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
          <div className="price">CHF {Number(product.price).toFixed(2)}</div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {!inCart ? (
              <button onClick={onAdd} className="btn btn-primary" aria-label="Add to cart">{t('addToCart')}</button>
            ) : (
              <>
                <button onClick={onDecrease} className="icon-btn" aria-label="Decrease quantity">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button onClick={onIncrease} className="icon-btn" aria-label="Increase quantity">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button onClick={onDelete} className="icon-btn" aria-label="Delete" title={t('removeFromCart')}>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      </Link>
    </div>
  )
}


