import { useState } from 'react'
import { toast } from 'react-toastify'
import { productFeatureService } from '../../services/productFeatureService.js'
import { useI18n } from '../../contexts/I18nContext.jsx'

export function FeaturesSection({ formData, setFormData, setError }) {
  const { t } = useI18n()
  const [featureTypeInput, setFeatureTypeInput] = useState('')
  const [featureTitleInput, setFeatureTitleInput] = useState('')
  const [featureDescriptionInput, setFeatureDescriptionInput] = useState('')
  const [substanceInputs, setSubstanceInputs] = useState({})
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(null)
  const [addingFeature, setAddingFeature] = useState(false)

  const handleAddFeature = async () => {
    if (!featureTypeInput.trim()) {
      setError(t('featureTypeRequired'))
      toast.error(t('featureTypeRequired'), {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    try {
      setAddingFeature(true)
      setError('')
      
      const featureData = {
        type: featureTypeInput.trim(),
        title: featureTitleInput.trim() || featureTypeInput.trim(),
        description: featureDescriptionInput.trim() || ''
      }
      
      const response = await productFeatureService.createFeature(featureData)
      const createdFeature = response.data?.data || response.data
      
      if (createdFeature) {
        const newFeature = {
          id: createdFeature.id,
          type: createdFeature.type || featureTypeInput.trim(),
          title: createdFeature.title || featureTitleInput.trim() || featureTypeInput.trim(),
          description: createdFeature.description || featureDescriptionInput.trim() || '',
          substances: []
        }

        setFormData(prev => ({
          ...prev,
          features: [...prev.features, newFeature]
        }))

        setFeatureTypeInput('')
        setFeatureTitleInput('')
        setFeatureDescriptionInput('')
        setCurrentFeatureIndex(null)
        toast.success(t('featureAddedSuccessfully'), {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('❌ Error adding feature:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          t('failedToAddFeature')
      setError(errorMessage)
      toast.error(t('failedToAddFeature') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setAddingFeature(false)
    }
  }

  const handleEditFeature = (index) => {
    const feature = formData.features[index]
    setFeatureTypeInput(feature.type)
    setFeatureTitleInput(feature.title)
    setFeatureDescriptionInput(feature.description)
    setCurrentFeatureIndex(index)
  }

  const handleUpdateFeature = () => {
    if (currentFeatureIndex === null) return
    if (!featureTypeInput.trim() || !featureTitleInput.trim()) {
      setError(t('featureTypeAndTitleRequired'))
      return
    }

    setFormData(prev => {
      const updatedFeatures = [...prev.features]
      updatedFeatures[currentFeatureIndex] = {
        ...updatedFeatures[currentFeatureIndex],
        type: featureTypeInput.trim(),
        title: featureTitleInput.trim(),
        description: featureDescriptionInput.trim() || ''
      }
      return {
        ...prev,
        features: updatedFeatures
      }
    })

    setFeatureTypeInput('')
    setFeatureTitleInput('')
    setFeatureDescriptionInput('')
    setCurrentFeatureIndex(null)
  }

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleAddSubstance = async (featureIndex) => {
    const substanceInput = substanceInputs[featureIndex] || ''
    if (!substanceInput.trim()) return

    const feature = formData.features[featureIndex]
    if (!feature || !feature.id) {
      setError(t('featureIdRequired'))
      toast.error(t('featureIdRequired'), {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    try {
      setError('')
      
      const substanceData = {
        description: substanceInput.trim(),
        featureId: Number(feature.id)
      }
      
      const response = await productFeatureService.createSubstance(substanceData)
      const createdSubstance = response.data?.data || response.data
      
      if (createdSubstance) {
        const newSubstance = {
          id: createdSubstance.id,
          description: createdSubstance.description || substanceInput.trim()
        }

        setFormData(prev => {
          const updatedFeatures = [...prev.features]
          updatedFeatures[featureIndex] = {
            ...updatedFeatures[featureIndex],
            substances: [
              ...updatedFeatures[featureIndex].substances,
              newSubstance
            ]
          }
          return {
            ...prev,
            features: updatedFeatures
          }
        })

        setSubstanceInputs(prev => ({
          ...prev,
          [featureIndex]: ''
        }))
        
        toast.success(t('substanceAddedSuccessfully'), {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('❌ Error adding substance:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          t('failedToAddSubstance')
      setError(errorMessage)
      toast.error(t('failedToAddSubstance') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    }
  }

  const handleRemoveSubstance = (featureIndex, substanceIndex) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features]
      updatedFeatures[featureIndex] = {
        ...updatedFeatures[featureIndex],
        substances: updatedFeatures[featureIndex].substances.filter((_, i) => i !== substanceIndex)
      }
      return {
        ...prev,
        features: updatedFeatures
      }
    })
  }

  return (
    <div className="section-container">
      <label className="section-label">
        {t('features')}
      </label>
      
      {/* Add/Edit Feature Form */}
      <div className="feature-form-container">
        <div className="feature-inputs-grid">
          <input
            type="text"
            value={featureTypeInput}
            onChange={(e) => setFeatureTypeInput(e.target.value)}
            placeholder={t('featureTypePlaceholder')}
            className="feature-input"
          />
          <input
            type="text"
            value={featureTitleInput}
            onChange={(e) => setFeatureTitleInput(e.target.value)}
            placeholder={t('featureTitlePlaceholder')}
            className="feature-input"
          />
        </div>
        <textarea
          value={featureDescriptionInput}
          onChange={(e) => setFeatureDescriptionInput(e.target.value)}
          placeholder={t('featureDescriptionPlaceholder')}
          rows="2"
          className="feature-textarea"
        />
        {currentFeatureIndex === null ? (
          <button
            type="button"
            onClick={handleAddFeature}
            disabled={addingFeature}
            className="btn"
          >
            {addingFeature ? t('adding') : t('addFeature')}
          </button>
        ) : (
          <div className="feature-buttons">
            <button
              type="button"
              onClick={handleUpdateFeature}
              className="btn"
            >
              {t('updateFeature')}
            </button>
            <button
              type="button"
              onClick={() => {
                setFeatureTypeInput('')
                setFeatureTitleInput('')
                setFeatureDescriptionInput('')
                setCurrentFeatureIndex(null)
              }}
              className="btn btn-outline"
            >
              {t('cancel')}
            </button>
          </div>
        )}
      </div>

      {/* Features List */}
      {formData.features.map((feature, featureIndex) => (
        <div key={featureIndex} className="feature-item">
          <div className="feature-header">
            <div>
              <strong>{feature.type}</strong> - {feature.title}
              {feature.description && <div className="feature-description">{feature.description}</div>}
            </div>
            <div className="feature-actions">
              <button
                type="button"
                onClick={() => handleEditFeature(featureIndex)}
                className="btn btn-outline btn-small"
              >
                {t('edit')}
              </button>
              <button
                type="button"
                onClick={() => handleRemoveFeature(featureIndex)}
                className="remove-feature-btn"
              >
                ×
              </button>
            </div>
          </div>

          {/* Substances for this feature */}
          <div className="substances-container">
            <div className="substance-input-container">
              <input
                type="text"
                value={substanceInputs[featureIndex] || ''}
                onChange={(e) => setSubstanceInputs(prev => ({
                  ...prev,
                  [featureIndex]: e.target.value
                }))}
                placeholder={t('addSubstancePlaceholder')}
                className="substance-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubstance(featureIndex)
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddSubstance(featureIndex)}
                className="btn btn-substance"
              >
                {t('addSubstance')}
              </button>
            </div>
            {feature.substances.map((substance, substanceIndex) => (
              <div key={substanceIndex} className="substance-item">
                <span className="substance-text">{substance.description}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubstance(featureIndex, substanceIndex)}
                  className="remove-substance-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

