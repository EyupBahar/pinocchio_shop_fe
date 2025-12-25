import { useState } from 'react'
import { toast } from 'react-toastify'
import { productFeatureService } from '../../services/productFeatureService.js'

export function FeaturesSection({ formData, setFormData, setError }) {
  const [featureTypeInput, setFeatureTypeInput] = useState('')
  const [featureTitleInput, setFeatureTitleInput] = useState('')
  const [featureDescriptionInput, setFeatureDescriptionInput] = useState('')
  const [substanceInputs, setSubstanceInputs] = useState({})
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(null)
  const [addingFeature, setAddingFeature] = useState(false)

  const handleAddFeature = async () => {
    if (!featureTypeInput.trim()) {
      setError('Feature type is required')
      toast.error('Feature type is required', {
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
        toast.success('Feature added successfully', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('❌ Error adding feature:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to add feature'
      setError(errorMessage)
      toast.error('Failed to add feature: ' + errorMessage, {
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
      setError('Feature type and title are required')
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
      setError('Feature ID is required. Please add the feature first.')
      toast.error('Feature ID is required', {
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
        
        toast.success('Substance added successfully', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('❌ Error adding substance:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to add substance'
      setError(errorMessage)
      toast.error('Failed to add substance: ' + errorMessage, {
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
        Features
      </label>
      
      {/* Add/Edit Feature Form */}
      <div className="feature-form-container">
        <div className="feature-inputs-grid">
          <input
            type="text"
            value={featureTypeInput}
            onChange={(e) => setFeatureTypeInput(e.target.value)}
            placeholder="Feature Type (e.g., Gönderim Bilgileri)"
            className="feature-input"
          />
          <input
            type="text"
            value={featureTitleInput}
            onChange={(e) => setFeatureTitleInput(e.target.value)}
            placeholder="Feature Title"
            className="feature-input"
          />
        </div>
        <textarea
          value={featureDescriptionInput}
          onChange={(e) => setFeatureDescriptionInput(e.target.value)}
          placeholder="Feature Description"
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
            {addingFeature ? 'Adding...' : 'Add Feature'}
          </button>
        ) : (
          <div className="feature-buttons">
            <button
              type="button"
              onClick={handleUpdateFeature}
              className="btn"
            >
              Update Feature
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
              Cancel
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
                Edit
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
                placeholder="Add substance description"
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
                Add
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

