import { useI18n } from '../contexts/I18nContext.jsx'

export function ContactUsPage() {
  const { t } = useI18n()
  
  return (
    <div className="container section" style={{ maxWidth: '900px', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#111827' }}>
        {t('contactUs')}
      </h1>

      <div style={{ lineHeight: '1.8', color: '#111827' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#9B724C' }}>
            {t('contactInformation') || 'Kontaktinformationen'}
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Pinocchio Shop</strong><br />
            Flawilerstrasse 22<br />
            9242 Oberuzwil, Schweiz
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>{t('phone') || 'Telefon'}:</strong> +41 71 9513651<br />
            <strong>{t('email') || 'E-Mail'}:</strong> info@pinocchio-oberuzwil.ch<br />
            <strong>{t('website') || 'WebSite'}:</strong> https://www.pinocchio-oberuzwil.ch/
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#9B724C' }}>
            {t('openingHours') || 'Öffnungszeiten'}
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            {t('openingHoursText') || 'Wir sind für Sie da. Bitte kontaktieren Sie uns für weitere Informationen.'}
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#9B724C' }}>
            {t('socialMedia') || 'Soziale Medien'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a 
              href="https://www.instagram.com/pinocchiosaucen?igsh=NmVxeTFmYjlyZ2U3"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#9B724C', textDecoration: 'none' }}
            >
              Instagram
            </a>
            <a 
              href="https://www.linkedin.com/in/pinocchio-saucen-b54611385/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#9B724C', textDecoration: 'none' }}
            >
              LinkedIn
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=6158092272648"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#9B724C', textDecoration: 'none' }}
            >
              Facebook
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

