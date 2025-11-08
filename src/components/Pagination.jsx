import { useI18n } from '../contexts/I18nContext.jsx'

export function Pagination({ page, totalPages, onPage }) {
  const { t } = useI18n()
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onPage(page - 1)} className="page-btn">←</button>
      <div className="text-muted">{t('page')} {page} / {totalPages}</div>
      <button disabled={page === totalPages} onClick={() => onPage(page + 1)} className="page-btn">→</button>
    </div>
  )
}



