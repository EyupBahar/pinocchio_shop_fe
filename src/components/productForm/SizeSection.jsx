import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { sizeService } from '../../services/sizeService.js'
import { useI18n } from '../../contexts/I18nContext.jsx'

export function SizeSection({ formData, setFormData, setError }) {
  const { t } = useI18n()
  const [sizes, setSizes] = useState([])
  const [sizeScaleTypes, setSizeScaleTypes] = useState([])
  const [newSizeScaleTypeInput, setNewSizeScaleTypeInput] = useState('')
  const [newSizeScaleTypeForSize, setNewSizeScaleTypeForSize] = useState('')
  const [newSizeAmountInput, setNewSizeAmountInput] = useState('')
  const [addingSize, setAddingSize] = useState(false)
  const [addingSizeScaleType, setAddingSizeScaleType] = useState(false)

  useEffect(() => {
    const loadSizes = async () => {
      try {
        const response = await sizeService.getAllSizes()
        const sizesData = response.data?.data || response.data || []
        const sizesArray = Array.isArray(sizesData) ? sizesData : []
        setSizes(sizesArray)
        
        const scaleTypesMap = new Map()
        sizesArray.forEach(size => {
          if (size.sizeScaleType && size.sizeScaleType.id) {
            if (!scaleTypesMap.has(size.sizeScaleType.id)) {
              scaleTypesMap.set(size.sizeScaleType.id, size.sizeScaleType)
            }
          }
        })
        setSizeScaleTypes(Array.from(scaleTypesMap.values()))
      } catch (err) {
        console.error('❌ Error loading sizes:', err)
      }
    }
    loadSizes()
  }, [])

  const handleSizeChange = (sizeId) => {
    setFormData(prev => ({
      ...prev,
      sizeId: sizeId ? Number(sizeId) : null
    }))
  }

  const handleAddNewSizeScaleType = async () => {
    if (!newSizeScaleTypeInput.trim()) {
      setError(t('sizeScaleTypeRequired'))
      return
    }

    try {
      setAddingSizeScaleType(true)
      setError('')
      
      const scaleTypeData = {
        name: newSizeScaleTypeInput.trim()
      }
      
      const response = await sizeService.createSizeScaleType(scaleTypeData)
      const createdScaleType = response.data?.data || response.data
      
      if (createdScaleType) {
        const sizesResponse = await sizeService.getAllSizes()
        const sizesData = sizesResponse.data?.data || sizesResponse.data || []
        const sizesArray = Array.isArray(sizesData) ? sizesData : []
        setSizes(sizesArray)
        
        const scaleTypesMap = new Map()
        sizesArray.forEach(size => {
          if (size.sizeScaleType && size.sizeScaleType.id) {
            if (!scaleTypesMap.has(size.sizeScaleType.id)) {
              scaleTypesMap.set(size.sizeScaleType.id, size.sizeScaleType)
            }
          }
        })
        if (createdScaleType.id && !scaleTypesMap.has(createdScaleType.id)) {
          scaleTypesMap.set(createdScaleType.id, createdScaleType)
        }
        setSizeScaleTypes(Array.from(scaleTypesMap.values()))
        
        setNewSizeScaleTypeInput('')
        toast.success(t('sizeScaleTypeAddedSuccessfully'), {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('❌ Error adding size scale type:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          t('failedToAddSizeScaleType')
      setError(errorMessage)
      toast.error(t('failedToAddSizeScaleType') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setAddingSizeScaleType(false)
    }
  }

  const handleAddNewSize = async () => {
    if (!newSizeScaleTypeForSize.trim() || !newSizeAmountInput.trim()) {
      setError(t('scaleTypeAndAmountRequired'))
      return
    }

    try {
      setAddingSize(true)
      setError('')
      
      let scaleTypeId = null
      const selectedScaleType = sizeScaleTypes.find(st => 
        st.name === newSizeScaleTypeForSize.trim()
      )
      
      if (selectedScaleType?.id) {
        scaleTypeId = selectedScaleType.id
      } else {
        const existingSize = sizes.find(s => 
          s.sizeScaleType?.name?.toLowerCase() === newSizeScaleTypeForSize.trim().toLowerCase()
        )
        
        if (existingSize?.sizeScaleType?.id) {
          scaleTypeId = existingSize.sizeScaleType.id
        } else {
          try {
            const scaleTypeResponse = await sizeService.createSizeScaleType({
              name: newSizeScaleTypeForSize.trim()
            })
            const createdScaleType = scaleTypeResponse.data?.data || scaleTypeResponse.data
            if (createdScaleType) {
              scaleTypeId = createdScaleType.id
              setSizeScaleTypes(prev => [...prev, createdScaleType])
            }
          } catch (scaleTypeErr) {
            console.error('❌ Error creating scale type:', scaleTypeErr)
          }
        }
      }
      
      if (!scaleTypeId) {
        setError(t('scaleTypeIdRequired'))
        setAddingSize(false)
        return
      }
      
      const sizeValue = `${newSizeAmountInput.trim()}${newSizeScaleTypeForSize.trim()}`
      const newSizeData = {
        size: sizeValue,
        scaleTypeId: Number(scaleTypeId)
      }
      
      const response = await sizeService.create(newSizeData)
      const createdSize = response.data?.data || response.data
      
      if (createdSize) {
        const sizesResponse = await sizeService.getAllSizes()
        const sizesData = sizesResponse.data?.data || sizesResponse.data || []
        const sizesArray = Array.isArray(sizesData) ? sizesData : []
        setSizes(sizesArray)
        
        const scaleTypesMap = new Map()
        sizesArray.forEach(size => {
          if (size.sizeScaleType && size.sizeScaleType.id) {
            if (!scaleTypesMap.has(size.sizeScaleType.id)) {
              scaleTypesMap.set(size.sizeScaleType.id, size.sizeScaleType)
            }
          }
        })
        setSizeScaleTypes(Array.from(scaleTypesMap.values()))
        
        setFormData(prev => ({
          ...prev,
          sizeId: createdSize.id
        }))
        setNewSizeScaleTypeForSize('')
        setNewSizeAmountInput('')
        toast.success(t('sizeAddedSuccessfully'), {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('❌ Error adding size:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          t('failedToAddSize')
      setError(errorMessage)
      toast.error(t('failedToAddSize') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setAddingSize(false)
    }
  }

  return (
    <div className="section-container">
      <label className="section-label">
        {t('sizeOptional')}
      </label>
      
      {/* Size Select Box */}
      <div className="size-subsection">
        <label className="size-section-label">
          {t('selectSize')}
        </label>
        <select
          value={formData.sizeId || ''}
          onChange={(e) => handleSizeChange(e.target.value)}
          className="form-select"
        >
          <option value="">{t('noSizeSelected')}</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.size}
            </option>
          ))}
        </select>
      </div>

      {/* Add New Size Scale Type */}
      <div className="size-subsection">
        <label className="size-section-label">
          {t('addNewSizeScaleType')}
        </label>
        <div className="size-input-container">
          <input
            type="text"
            value={newSizeScaleTypeInput}
            onChange={(e) => setNewSizeScaleTypeInput(e.target.value)}
            placeholder={t('enterScaleType')}
            className="size-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddNewSizeScaleType()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddNewSizeScaleType}
            disabled={addingSizeScaleType || !newSizeScaleTypeInput.trim()}
            className="btn btn-nowrap"
          >
            {addingSizeScaleType ? t('adding') : t('addScaleType')}
          </button>
        </div>
      </div>

      {/* Add New Size */}
      <div className="size-subsection">
        <label className="size-section-label">
          {t('addNewSize')}
        </label>
        <div className="size-grid">
          <select
            value={newSizeScaleTypeForSize}
            onChange={(e) => setNewSizeScaleTypeForSize(e.target.value)}
            className="form-select"
          >
            <option value="">{t('selectScaleType')}</option>
            {sizeScaleTypes.map((scaleType) => (
              <option key={scaleType.id} value={scaleType.name}>
                {scaleType.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSizeAmountInput}
            onChange={(e) => setNewSizeAmountInput(e.target.value)}
            placeholder={t('amountPlaceholder')}
            className="form-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddNewSize()
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleAddNewSize}
          disabled={addingSize || !newSizeScaleTypeForSize.trim() || !newSizeAmountInput.trim()}
          className="btn btn-full-width"
        >
          {addingSize ? t('adding') : t('addSize')}
        </button>
      </div>
    </div>
  )
}

