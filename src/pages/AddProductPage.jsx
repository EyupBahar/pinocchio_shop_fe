import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productService } from '../services/productService.js'
import { useI18n } from '../contexts/I18nContext.jsx'

export function AddProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const { t } = useI18n()
  
  const [formData, setFormData] = useState({
    deliveryTime: '',
    image: '',
    images: [],
    rating: 0,
    title: '',
    description: '',
    productFeatures: [],
    shipmentFeatures: [],
    deliveryFeatures: [],
    price: 0,
    discountedPrice: 0,
    isActive: true,
    categoryId: 0
  })
  const [initialFormData, setInitialFormData] = useState(null)
  const [originalProduct, setOriginalProduct] = useState(null) // Store original product from API

  const [imageInput, setImageInput] = useState('')
  const [productFeatureInput, setProductFeatureInput] = useState('')
  const [shipmentFeatureInput, setShipmentFeatureInput] = useState('')
  const [deliveryFeatureInput, setDeliveryFeatureInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        setLoading(true)
        try {
          const byIdResponse = await productService.getById(id)
          const product = byIdResponse?.data?.data || byIdResponse?.data || null
          
          if (product) {
            // Debug: Log the full response from backend
            console.log('📥 GetDetails Response:', JSON.stringify(product, null, 2))
            console.log('📥 Product features structure:', {
              hasFeaturesObject: !!product.features,
              featuresObject: product.features,
              rootProductFeatures: product.product_features,
              rootShipmentFeatures: product.shipment_features,
              rootDeliveryFeatures: product.delivery_features
            })
            
            // Handle features structure from backend (can be in features object or root level)
            const features = product.features || {}
            const updatedFormData = {
              deliveryTime: product.deliveryTime || '',
              image: product.image || '',
              images: product.images || [],
              rating: product.rating || 0,
              title: product.title || '',
              description: features.description || product.description || '',
              productFeatures: features.product_features || product.product_features || [],
              shipmentFeatures: features.shipment_features || product.shipment_features || [],
              deliveryFeatures: features.delivery_features || product.delivery_features || [],
              price: product.price || 0,
              discountedPrice: product.discountedPrice || 0,
              isActive: product.isActive !== undefined ? product.isActive : true,
              categoryId: product.categoryId || 0
            }
            console.log('📥 Parsed FormData:', updatedFormData)
            setFormData(updatedFormData)
            setInitialFormData(updatedFormData)
            setOriginalProduct(product) // Store original product structure
          } else {
            console.warn('⚠️ No product data found for id:', id)
            setError(`Product not found (ID: ${id})`)
          }
        } catch (err) {
          console.error('❌ Error loading product:', err)
          console.error('❌ Error details:', err?.response)
          if (err?.response?.status === 401) {
            setError('Unauthorized. Please login to edit products.')
          } else if (err?.response?.status === 404) {
            setError(`Product not found (ID: ${id})`)
          } else {
            setError(`Failed to load product: ${err?.message || 'Unknown error'}`)
          }
        } finally {
          setLoading(false)
        }
      }
      loadProduct()
    }
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }))
      setImageInput('')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleAddFeature = (type) => {
    let inputValue = ''
    let featureKey = ''
    
    switch(type) {
      case 'product':
        inputValue = productFeatureInput
        featureKey = 'productFeatures'
        break
      case 'shipment':
        inputValue = shipmentFeatureInput
        featureKey = 'shipmentFeatures'
        break
      case 'delivery':
        inputValue = deliveryFeatureInput
        featureKey = 'deliveryFeatures'
        break
    }

    if (inputValue.trim()) {
      setFormData(prev => {
        const currentArray = prev[featureKey] || []
        const newArray = [...currentArray, inputValue.trim()]
        const newData = {
          ...prev,
          [featureKey]: newArray
        }
        console.log(`✅ Added ${type} feature:`, {
          inputValue: inputValue.trim(),
          previousArray: currentArray,
          newArray: newArray,
          fullFormData: newData
        })
        return newData
      })
      
      switch(type) {
        case 'product':
          setProductFeatureInput('')
          break
        case 'shipment':
          setShipmentFeatureInput('')
          break
        case 'delivery':
          setDeliveryFeatureInput('')
          break
      }
    }
  }

  const handleRemoveFeature = (type, index) => {
    let featureKey = ''
    switch(type) {
      case 'product':
        featureKey = 'productFeatures'
        break
      case 'shipment':
        featureKey = 'shipmentFeatures'
        break
      case 'delivery':
        featureKey = 'deliveryFeatures'
        break
    }

    setFormData(prev => ({
      ...prev,
      [featureKey]: prev[featureKey].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!formData.title || !formData.description || !formData.image) {
      setError('Please fill in all required fields (Title, Description, Image)')
      return
    }

    // Validate price is greater than 0
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Price must be greater than 0')
      return
    }

    try {
      setLoading(true)
      
      // Debug: Log formData state
      console.log('🔍 FormData state (BEFORE processing):', {
        productFeatures: formData.productFeatures,
        shipmentFeatures: formData.shipmentFeatures,
        deliveryFeatures: formData.deliveryFeatures,
        productFeaturesType: typeof formData.productFeatures,
        productFeaturesIsArray: Array.isArray(formData.productFeatures),
        fullFormData: formData
      })
      
      // Ensure arrays are properly set (not undefined) - backend expects string arrays
      const productFeatures = Array.isArray(formData.productFeatures) ? formData.productFeatures : []
      const shipmentFeatures = Array.isArray(formData.shipmentFeatures) ? formData.shipmentFeatures : []
      const deliveryFeatures = Array.isArray(formData.deliveryFeatures) ? formData.deliveryFeatures : []
      
      console.log('🔍 Processed features:', {
        productFeatures,
        shipmentFeatures,
        deliveryFeatures,
        productFeaturesLength: productFeatures.length,
        shipmentFeaturesLength: shipmentFeatures.length,
        deliveryFeaturesLength: deliveryFeatures.length
      })
      
      // Send all fields at root level, not nested in features object
      const productData = {
        deliveryTime: String(formData.deliveryTime || ''),
        image: formData.image.trim(),
        images: Array.isArray(formData.images) ? formData.images : [],
        rating: Number(formData.rating) || 0,
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        price: Number(formData.price) || 0,
        discountedPrice: Number(formData.discountedPrice) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        categoryId: Number(formData.categoryId) || 0,
        product_features: productFeatures,
        shipment_features: shipmentFeatures,
        delivery_features: deliveryFeatures
      }
      
      console.log('📤 Sending product data:', JSON.stringify(productData, null, 2))

      if (isEditMode) {
        // Only send changed fields
        if (!initialFormData || !originalProduct) {
          setError(t('initialDataNotLoaded'))
          setLoading(false)
          return
        }

        const changedFields = {}
        
        // Compare each field and add to changedFields if different
        // Format according to the required structure (root level, not nested)
        if (formData.deliveryTime !== initialFormData.deliveryTime) {
          changedFields.deliveryTime = String(formData.deliveryTime || '')
        }
        if (formData.image !== initialFormData.image) {
          changedFields.image = formData.image.trim()
        }
        if (JSON.stringify(formData.images) !== JSON.stringify(initialFormData.images)) {
          changedFields.images = Array.isArray(formData.images) ? formData.images : []
        }
        if (Number(formData.rating) !== Number(initialFormData.rating)) {
          changedFields.rating = Number(formData.rating) || 0
        }
        if (formData.title !== initialFormData.title) {
          changedFields.title = formData.title.trim()
        }
        if (Number(formData.price) !== Number(initialFormData.price)) {
          changedFields.price = Number(formData.price) || 0
        }
        if (Number(formData.discountedPrice) !== Number(initialFormData.discountedPrice)) {
          changedFields.discountedPrice = Number(formData.discountedPrice) || 0
        }
        if (formData.isActive !== initialFormData.isActive) {
          changedFields.isActive = formData.isActive !== undefined ? formData.isActive : true
        }
        if (Number(formData.categoryId) !== Number(initialFormData.categoryId)) {
          changedFields.categoryId = Number(formData.categoryId) || 0
        }

        // Check description and features changes - add to root level, not nested
        if (formData.description !== initialFormData.description) {
          changedFields.description = formData.description.trim() || ''
        }
        if (JSON.stringify(productFeatures) !== JSON.stringify(initialFormData.productFeatures || [])) {
          changedFields.product_features = productFeatures
        }
        if (JSON.stringify(shipmentFeatures) !== JSON.stringify(initialFormData.shipmentFeatures || [])) {
          changedFields.shipment_features = shipmentFeatures
        }
        if (JSON.stringify(deliveryFeatures) !== JSON.stringify(initialFormData.deliveryFeatures || [])) {
          changedFields.delivery_features = deliveryFeatures
        }

        // Only send if there are changes
        if (Object.keys(changedFields).length === 0) {
          setError(t('noChangesDetected'))
          setLoading(false)
          return
        }

        // Add ID to changedFields for update
        const updateData = { ...changedFields, id: Number(id) }
        console.log('📤 Sending only changed fields:', JSON.stringify(updateData, null, 2))
        await productService.update(id, updateData)
        setSuccess('Product updated successfully!')
      } else {
        await productService.create(productData)
        setSuccess('Product added successfully!')
      }
      
      setTimeout(() => {
        navigate('/shop')
      }, 2000)
    } catch (err) {
      console.error('❌ Error saving product:', err)
      console.error('❌ Full error:', JSON.stringify(err, null, 2))
      console.error('❌ Error response:', err.response)
      console.error('❌ Error response data:', err.response?.data)
      console.error('❌ Error response status:', err.response?.status)
      
      const errorDetails = err.response?.data ? JSON.stringify(err.response.data, null, 2) : 'No details'
      console.error('❌ Full error details:', errorDetails)
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          `Server error: ${err.response?.status || 'Unknown'}`
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      setIsDeleting(true)
      await productService.delete(id)
      setSuccess('Product deleted successfully!')
      setTimeout(() => {
        navigate('/shop')
      }, 2000)
    } catch (err) {
      console.error('❌ Error deleting product:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to delete product'
      setError(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="container section">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>{t('editProduct')}</h2>
        <div>{t('loadingProduct')}</div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>
        {isEditMode ? t('editProduct') : t('addProduct')}
      </h2>
      
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          background: '#fee', 
          color: '#c33', 
          borderRadius: '0.5rem' 
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          background: '#efe', 
          color: '#3c3', 
          borderRadius: '0.5rem' 
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('title')} *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('description')} *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('productFeatures')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={productFeatureInput}
              onChange={(e) => setProductFeatureInput(e.target.value)}
              placeholder="Add a product feature"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature('product')
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddFeature('product')}
              className="btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              {t('add')}
            </button>
          </div>
          {formData.productFeatures.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.productFeatures.map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}>
                  <span style={{ fontSize: '0.9rem', flex: 1 }}>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature('product', index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('shipmentFeatures')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={shipmentFeatureInput}
              onChange={(e) => setShipmentFeatureInput(e.target.value)}
              placeholder="Add a shipment feature"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature('shipment')
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddFeature('shipment')}
              className="btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              {t('add')}
            </button>
          </div>
          {formData.shipmentFeatures.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.shipmentFeatures.map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}>
                  <span style={{ fontSize: '0.9rem', flex: 1 }}>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature('shipment', index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('deliveryFeatures')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={deliveryFeatureInput}
              onChange={(e) => setDeliveryFeatureInput(e.target.value)}
              placeholder="Add a delivery feature"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature('delivery')
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddFeature('delivery')}
              className="btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              {t('add')}
            </button>
          </div>
          {formData.deliveryFeatures.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {formData.deliveryFeatures.map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}>
                  <span style={{ fontSize: '0.9rem', flex: 1 }}>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature('delivery', index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              {t('price')} *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              {t('discountedPrice')}
            </label>
            <input
              type="number"
              name="discountedPrice"
              value={formData.discountedPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('mainImageUrl')} *
          </label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
            required
          />
          {formData.image && (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              marginTop: '0.5rem'
            }}>
              <img 
                src={formData.image} 
                alt="Preview" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block' 
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            {t('additionalImages')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="btn"
              style={{ whiteSpace: 'nowrap' }}
            >
              {t('add')}
            </button>
          </div>
          {formData.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.images.map((img, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{img.substring(0, 30)}...</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              {t('category')}
            </label>
            <select
              name="categoryId"
              value={String(formData.categoryId === 'single' ? 1 : formData.categoryId === 'combination' ? 2 : formData.categoryId || '')}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                background: '#fff'
              }}
              required
            >
              <option value="" disabled>{t('selectCategory')}</option>
              <option value="1">{t('singleProduct')}</option>
              <option value="2">{t('combination')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              {t('rating')}
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              {t('deliveryTime')}
            </label>
            <input
              type="text"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              placeholder="e.g., 2-3 days"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            id="isActive"
            style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
          />
          <label htmlFor="isActive" style={{ cursor: 'pointer', fontWeight: 500 }}>
            {t('productIsActive')}
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn"
              style={{ 
                background: '#dc2626', 
                color: '#fff',
                border: '1px solid #dc2626'
              }}
            >
              {isDeleting ? t('deleting') : t('deleteProduct')}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="btn btn-outline"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('saving') : isEditMode ? t('updateProduct') : t('createProduct')}
          </button>
        </div>
      </form>
    </div>
  )
}
