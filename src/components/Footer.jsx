import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext.jsx'
import { FaInstagram, FaLinkedin, FaFacebook } from 'react-icons/fa'
import logoFooter from '../assets/neu_logo.svg'

export function Footer() {
  const { t } = useI18n()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  return (
    <footer className="footer" style={{ background: 'transparent', minHeight: '90px' }}>
      <div className="container footer-inner" style={{ maxWidth: '1216px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative', minHeight: '90px' }}>
        {/* Sol alt köşedeki logo */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            border: isHomePage ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid #9B724C',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)'
          }}>
            <img src={logoFooter} alt="Pinocchio Shop" style={{ height: '80px', width: '80px', objectFit: 'contain' }} />
          </div>
        </div>
        
        {/* Ortadaki metin */}
        <div style={{ 
          textAlign: 'center', 
          color: '#9B724C', 
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flex: 1
        }}>
          <span>©{new Date().getFullYear()} Pinocchio Shop</span>
          <span>|</span>
          <span>{t('terms')}</span>
          <span>|</span>
          <Link to="/datenschutz" style={{ color: '#9B724C', textDecoration: 'none' }}>{t('privacy')}</Link>
          <span>|</span>
          <Link to="/impressum" style={{ color: '#9B724C', textDecoration: 'none' }}>{t('imprint')}</Link>
        </div>
        
        {/* Sağ alt köşedeki sosyal medya iconları */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <a 
            href="https://www.instagram.com/pinocchiosaucen?igsh=NmVxeTFmYjlyZ2U3"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #9B724C',
              color: '#9B724C',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              background: '#ffffff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f6f6f6'
              e.currentTarget.style.transform = 'scale(1.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FaInstagram size={22} />
          </a>
          
          <a 
            href="https://www.linkedin.com/in/pinocchio-saucen-b54611385/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #9B724C',
              color: '#9B724C',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              background: '#ffffff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f6f6f6'
              e.currentTarget.style.transform = 'scale(1.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FaLinkedin size={22} />
          </a>
          
          <a 
            href="https://www.facebook.com/profile.php?id=6158092272648"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #9B724C',
              color: '#9B724C',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              background: '#ffffff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f6f6f6'
              e.currentTarget.style.transform = 'scale(1.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <FaFacebook size={22} />
          </a>
        </div>
      </div>
    </footer>
  )
}


