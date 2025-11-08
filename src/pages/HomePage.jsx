import { Link } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext.jsx'

export function HomePage() {
  const { t } = useI18n()
  return (
    <div>
      <section style={{ 
        position: 'relative',
        minHeight: 'calc(100vh - 240px)',
        display: 'flex',
        alignItems: 'flex-start',
        background: 'transparent',
        overflow: 'hidden',
        paddingTop: '1.25rem'
      }}>
        {/* Background video (light, without dark overlay) */}
        <iframe
          src={`https://www.youtube.com/embed/ZN14b3toXJY?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playlist=ZN14b3toXJY&rel=0&iv_load_policy=3`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            border: 'none',
            zIndex: -1,
            objectFit: 'cover'
          }}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          title="Background Video"
        />
        <div className="container section" style={{ textAlign: 'center', paddingTop: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)', fontWeight: 800, letterSpacing: '-.025em', color: '#fff9c2', marginBottom: '1rem' }}>{t('heroTitle')}</h1>
          <p style={{ marginTop: '1rem', color: '#fff9c2', fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="mt-8" style={{ marginTop: '2rem' }}>
            <Link to="/shop" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.875rem 1.5rem' }}>{t('shop')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}



