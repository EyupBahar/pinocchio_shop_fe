import { useI18n } from '../contexts/I18nContext.jsx'

export function AboutUsPage() {
  const { t } = useI18n()
  
  return (
    <div className="container section" style={{ maxWidth: '900px', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#111827' }}>
        {t('aboutUs')}
      </h1>

      <div style={{ lineHeight: '1.8', color: '#111827' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#9B724C' }}>
            {t('aboutUsTitle') || 'Über uns'}
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('aboutUsText') || 'Willkommen bei Pinocchio Shop! Wir sind stolz darauf, hochwertige Produkte anzubieten und unseren Kunden ein außergewöhnliches Einkaufserlebnis zu bieten.'}
          </p>
          <p style={{ marginBottom: '1rem' }}>
            {t('aboutUsText2') || 'Unser Ziel ist es, die besten Produkte zu fairen Preisen anzubieten und dabei höchste Qualitätsstandards einzuhalten.'}
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#9B724C' }}>
            {t('ourMission') || 'Unsere Mission'}
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            {t('ourMissionText') || 'Wir setzen uns dafür ein, unseren Kunden die beste Erfahrung zu bieten und dabei nachhaltig und verantwortungsbewusst zu handeln.'}
          </p>
        </section>

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
      </div>
    </div>
  )
}

