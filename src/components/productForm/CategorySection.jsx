import { useI18n } from '../../contexts/I18nContext.jsx'

export function CategorySection({ formData, handleCategoryTypeChange }) {
  const { t } = useI18n()

  return (
    <div className="section-container">
      <label className="section-label">
        {t('category')} *
      </label>
      <select
        value={formData.categoryType}
        onChange={(e) => handleCategoryTypeChange(e.target.value)}
        className="form-select"
        required
      >
        <option value="" disabled>{t('selectCategory')}</option>
        <option value="single">{t('singleProduct')}</option>
        <option value="combination">{t('combination')}</option>
      </select>
    </div>
  )
}

