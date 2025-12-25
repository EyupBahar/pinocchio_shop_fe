import { useI18n } from '../../contexts/I18nContext.jsx'

export function BasicInfoSection({ formData, handleChange }) {
  const { t } = useI18n()

  return (
    <>
      <div className="form-group">
        <label className="form-label">
          {t('title')} *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          {t('description')} *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="form-textarea"
          required
        />
      </div>

      <div className="price-grid">
        <div>
          <label className="form-label">
            {t('price')} *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">
            {t('discountedPrice')}
          </label>
          <input
            type="number"
            name="discountedPrice"
            value={formData.discountedPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="form-input"
          />
        </div>
      </div>
    </>
  )
}

