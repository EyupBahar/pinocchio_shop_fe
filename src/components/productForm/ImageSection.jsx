import { useState } from 'react'
import { useI18n } from '../../contexts/I18nContext.jsx'

export function ImageSection({ formData, handleChange, setFormData }) {
  const { t } = useI18n()
  const [imageInput, setImageInput] = useState('')

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

  return (
    <>
      <div className="form-group">
        <label className="form-label">
          {t('mainImageUrl')} *
        </label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="main-image-input"
          required
        />
        {formData.image && (
          <div className="image-preview-container">
            <img 
              src={formData.image} 
              alt="Preview" 
              className="image-preview"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'
              }}
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          {t('additionalImages')}
        </label>
        <div className="additional-images-input-container">
          <input
            type="text"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="additional-images-input"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="btn btn-nowrap"
          >
            {t('add')}
          </button>
        </div>
        {formData.images.length > 0 && (
          <div className="images-list">
            {formData.images.map((img, index) => (
              <div key={index} className="image-item">
                <span className="image-item-text">{img.substring(0, 30)}...</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="remove-image-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

