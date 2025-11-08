import { useI18n } from '../contexts/I18nContext.jsx'

export function SortBar({ sort, setSort }) {
  const { t } = useI18n()
  return (
    <div className="sortbar">
      <label className="text-muted">{t('sorting')}</label>
      <select value={sort} onChange={(e) => setSort(e.target.value)} className="select">
        <option value="featured">{t('featured')}</option>
        <option value="price-asc">{t('priceAsc')}</option>
        <option value="price-desc">{t('priceDesc')}</option>
      </select>
    </div>
  )
}



