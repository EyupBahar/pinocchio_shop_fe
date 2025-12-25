import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { productService } from '../services/productService.js'
import { sizeService } from '../services/sizeService.js'
import { useI18n } from '../contexts/I18nContext.jsx'
import { BasicInfoSection } from '../components/productForm/BasicInfoSection.jsx'
import { ImageSection } from '../components/productForm/ImageSection.jsx'
import { FeaturesSection } from '../components/productForm/FeaturesSection.jsx'
import { CategorySection } from '../components/productForm/CategorySection.jsx'
import { SizeSection } from '../components/productForm/SizeSection.jsx'
import { FormActions } from '../components/productForm/FormActions.jsx'
import './addProductPage.css'

export function AddProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const { t } = useI18n()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountedPrice: '',
    image: '',
    images: [],
    features: [],
    category: { id: null, name: '', description: '', slug: '' },
    categoryType: '',
    sizeId: null
  })
  const [initialFormData, setInitialFormData] = useState(null)
  const [originalProduct, setOriginalProduct] = useState(null)
  const [error, setError] = useState('')
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
            const updatedFormData = {
              title: product.title || '',
              description: product.description || '',
              price: product.price ? String(product.price) : '',
              discountedPrice: product.discountedPrice ? String(product.discountedPrice) : '',
              image: product.image || '',
              images: Array.isArray(product.images) ? product.images : [],
              features: Array.isArray(product.features) ? product.features.map(f => ({
                id: f.id,
                type: f.type || '',
                title: f.title || '',
                description: f.description || '',
                substances: Array.isArray(f.substances) ? f.substances.map(s => ({
                  id: s.id,
                  description: s.description || ''
                })) : []
              })) : [],
              category: product.category ? {
                id: product.category.id || null,
                name: product.category.name || '',
                description: product.category.description || '',
                slug: product.category.slug || ''
              } : { id: null, name: '', description: '', slug: '' },
              categoryType: product.category?.id === 1 ? 'single' : product.category?.id === 2 ? 'combination' : '',
              sizeId: product.size?.id || null
            }
            setFormData(updatedFormData)
            setInitialFormData(JSON.parse(JSON.stringify(updatedFormData)))
            setOriginalProduct(product)
          } else {
            console.warn('⚠️ No product data found for id:', id)
            setError(`Product not found (ID: ${id})`)
          }
        } catch (err) {
          console.error('❌ Error loading product:', err)
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

  const handleCategoryTypeChange = (categoryType) => {
    const categoryMap = {
      'single': {
        id: 1,
        name: 'Einzelstück',
        description: '',
        slug: 'einzelstueck'
      },
      'combination': {
        id: 2,
        name: 'Geschenksets',
        description: '',
        slug: 'geschenksets'
      }
    }

    const categoryData = categoryMap[categoryType] || { id: null, name: '', description: '', slug: '' }
    
    setFormData(prev => ({
      ...prev,
      categoryType: categoryType,
      category: categoryData
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.description || !formData.image) {
      setError('Please fill in all required fields (Title, Description, Image)')
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError('Price must be greater than 0')
      return
    }

    if (!formData.category.id || !formData.category.name) {
      setError('Category ID and name are required')
      return
    }

    try {
      setLoading(true)
      
      const discountedPriceValue = formData.discountedPrice && formData.discountedPrice.trim() 
        ? String(Number(formData.discountedPrice).toFixed(2)) 
        : null
      
      const formattedFeatures = formData.features.map(f => {
        const feature = {
          type: f.type.trim(),
          title: f.title.trim(),
          description: f.description.trim() || '',
          substances: f.substances && Array.isArray(f.substances)
            ? f.substances.map(s => ({
                id: s.id,
                description: s.description.trim()
              })).filter(s => s.description)
            : []
        }
        if (f.id) {
          feature.id = f.id
        }
        return feature
      }).filter(f => f.type)
      
      // Get sizes for size formatting
      let formattedSize = null
      if (formData.sizeId) {
        try {
          const sizesResponse = await sizeService.getAllSizes()
          const sizesData = sizesResponse.data?.data || sizesResponse.data || []
          const sizesArray = Array.isArray(sizesData) ? sizesData : []
          const selectedSize = sizesArray.find(s => s.id === formData.sizeId)
          
          if (selectedSize) {
            formattedSize = {
              id: Number(selectedSize.id),
              size: selectedSize.size || '',
              sizeScaleType: selectedSize.sizeScaleType ? {
                id: Number(selectedSize.sizeScaleType.id),
                name: selectedSize.sizeScaleType.name || '',
                code: selectedSize.sizeScaleType.code || ''
              } : null,
              sizeCode: selectedSize.sizeCode || ''
            }
          }
        } catch (err) {
          console.error('❌ Error loading sizes for submit:', err)
        }
      }
      
      const categorySlug = formData.category.slug.trim() || formData.category.name.toLowerCase().replace(/\s+/g, '-')
      
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: String(Number(formData.price).toFixed(2)),
        image: formData.image.trim(),
        images: Array.isArray(formData.images) ? formData.images.filter(img => img.trim()) : [],
        features: formattedFeatures,
        category: {
          id: Number(formData.category.id),
          name: formData.category.name.trim(),
          description: formData.category.description.trim() || '',
          slug: categorySlug
        }
      }
      
      if (discountedPriceValue) {
        productData.discountedPrice = discountedPriceValue
      }
      
      if (formattedSize) {
        productData.size = formattedSize
      }

      if (isEditMode) {
        if (!initialFormData || !originalProduct) {
          setError('Initial data not loaded')
          setLoading(false)
          return
        }

        const changedFields = {}
        
        if (formData.title !== initialFormData.title) {
          changedFields.title = formData.title.trim()
        }
        if (formData.description !== initialFormData.description) {
          changedFields.description = formData.description.trim()
        }
        if (formData.price !== initialFormData.price) {
          changedFields.price = String(Number(formData.price).toFixed(2))
        }
        if (formData.discountedPrice !== initialFormData.discountedPrice) {
          const discountedPriceValue = formData.discountedPrice && formData.discountedPrice.trim() 
            ? String(Number(formData.discountedPrice).toFixed(2)) 
            : null
          changedFields.discountedPrice = discountedPriceValue
        }
        if (formData.image !== initialFormData.image) {
          changedFields.image = formData.image.trim()
        }
        if (JSON.stringify(formData.images) !== JSON.stringify(initialFormData.images)) {
          changedFields.images = Array.isArray(formData.images) ? formData.images.filter(img => img.trim()) : []
        }
        if (JSON.stringify(formData.features) !== JSON.stringify(initialFormData.features)) {
          changedFields.features = formData.features.map(f => ({
            type: f.type.trim(),
            title: f.title.trim(),
            description: f.description.trim() || '',
            substances: f.substances.map(s => ({
              description: s.description.trim()
            })).filter(s => s.description)
          })).filter(f => f.type && f.title)
        }
        if (JSON.stringify(formData.category) !== JSON.stringify(initialFormData.category)) {
          changedFields.category = {
            id: Number(formData.category.id),
            name: formData.category.name.trim(),
            description: formData.category.description.trim() || '',
            slug: formData.category.slug.trim() || formData.category.name.toLowerCase().replace(/\s+/g, '-')
          }
        }
        if (formData.sizeId !== initialFormData.sizeId) {
          if (formData.sizeId && formattedSize) {
            changedFields.size = formattedSize
          } else {
            changedFields.size = null
          }
        }

        if (Object.keys(changedFields).length === 0) {
          setError('No changes detected')
          setLoading(false)
          return
        }

        await productService.update(id, changedFields)
        toast.success(t('productUpdatedSuccessfully'), {
          position: 'top-right',
          autoClose: 3000,
        })
      } else {
        try {
          await productService.create(productData)
          toast.success(t('productAddedSuccessfully'), {
            position: 'top-right',
            autoClose: 3000,
          })
          setTimeout(() => {
            navigate('/shop')
          }, 2000)
        } catch (createErr) {
          if (createErr.response?.status === 500) {
            console.log('🔄 500 error received. Trying alternative format with categoryId only...')
            const alternativeData = {
              ...productData,
              categoryId: Number(formData.category.id)
            }
            delete alternativeData.category
            
            try {
              await productService.create(alternativeData)
              toast.success(t('productAddedSuccessfully'), {
                position: 'top-right',
                autoClose: 3000,
              })
              setTimeout(() => {
                navigate('/shop')
              }, 2000)
              return
            } catch (altErr) {
              console.error('❌ Alternative format also failed:', altErr)
            }
          }
          
          const errorMessage = createErr.response?.data?.message || 
                              createErr.response?.data?.error || 
                              createErr.message || 
                              `Server error: ${createErr.response?.status || 'Unknown'}`
          
          const detailedError = createErr.response?.data?.errors 
            ? JSON.stringify(createErr.response.data.errors, null, 2)
            : createErr.response?.data 
            ? JSON.stringify(createErr.response.data, null, 2)
            : null
          
          setError(detailedError || errorMessage)
          toast.error(t('errorOccurredToast') + ': ' + errorMessage, {
            position: 'top-right',
            autoClose: 5000,
          })
          throw createErr
        }
      }
    } catch (err) {
      console.error('❌ Error saving product:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          `Server error: ${err.response?.status || 'Unknown'}`
      
      const detailedError = err.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors, null, 2)
        : err.response?.data 
        ? JSON.stringify(err.response.data, null, 2)
        : null
      
      setError(detailedError || errorMessage)
      toast.error(t('errorOccurredToast') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
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
      toast.success(t('productDeletedSuccessfully'), {
        position: 'top-right',
        autoClose: 3000,
      })
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
      toast.error(t('errorOccurredToast') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="container section">
        <h2 className="page-title">{t('editProduct')}</h2>
        <div>{t('loadingProduct')}</div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h2 className="page-title">
        {isEditMode ? t('editProduct') : t('addProduct')}
      </h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <BasicInfoSection 
          formData={formData} 
          handleChange={handleChange} 
        />

        <ImageSection 
          formData={formData} 
          handleChange={handleChange} 
          setFormData={setFormData} 
        />

        <FeaturesSection 
          formData={formData} 
          setFormData={setFormData} 
          setError={setError} 
        />

        <CategorySection 
          formData={formData} 
          handleCategoryTypeChange={handleCategoryTypeChange} 
        />

        <SizeSection 
          formData={formData} 
          setFormData={setFormData} 
          setError={setError} 
        />

        <FormActions 
          isEditMode={isEditMode}
          loading={loading}
          isDeleting={isDeleting}
          onDelete={handleDelete}
        />
      </form>
    </div>
  )
}
