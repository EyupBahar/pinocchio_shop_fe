import { useI18n } from '../contexts/I18nContext.jsx'
import { BsGiftFill } from 'react-icons/bs'

export function CategoryFilter({ categories, activeId, onChange }) {
  const { t } = useI18n()
  
  // İki kategori için toggle switch
  if (categories.length === 2) {
    const [category1, category2] = categories
    const isFirstActive = activeId === category1.id
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          borderRadius: '25px',
          border: '1px solid #4A4A4A',
          overflow: 'hidden',
          background: 'white',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}>
          <button
            onClick={() => onChange(category1.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: 'none',
              background: isFirstActive ? '#D4B88C' : 'white',
              color: isFirstActive ? 'white' : '#4A4A4A',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: isFirstActive ? '25px 0 0 25px' : '0',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            {t('singleProduct')}
          </button>
          <button
            onClick={() => onChange(category2.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: 'none',
              background: !isFirstActive ? '#D4B88C' : 'white',
              color: !isFirstActive ? 'white' : '#4A4A4A',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: !isFirstActive ? '0 25px 25px 0' : '0',
              minWidth: '120px',
              justifyContent: 'center'
            }}
          >
            <BsGiftFill size={16} />
            {t('combination')}
          </button>
        </div>
        
        {/* Alle Produkte butonu */}
        <button
          onClick={() => onChange('all')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: '#D4B88C',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {t('allProducts')}
        </button>
      </div>
    )
  }
  
  // Çoklu kategori için normal butonlar
  return (
    <div className="category-row">
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`category-btn${activeId === c.id ? ' active' : ''}`}
        >
          {t(c.nameKey)}
        </button>
      ))}
    </div>
  )
}



