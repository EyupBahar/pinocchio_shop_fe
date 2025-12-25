import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext.jsx'

export function FormActions({ 
  isEditMode, 
  loading, 
  isDeleting, 
  onDelete 
}) {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="form-actions">
      {isEditMode && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="btn delete-btn"
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
  )
}

