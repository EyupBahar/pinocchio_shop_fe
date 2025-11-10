import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { MiniCart } from './MiniCart.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import logo from '../assets/neu_logo.svg'

export function Header() {
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useI18n()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="header" style={{ background: '#ffffff', boxShadow: undefined }}>
        <div className="container header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <Link to="/" className="site-title" style={{ background: '#ffffff' }}>
              <div className="header-logo" style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                // marginTop: isHomePage ? '20px' : undefined,
                justifyContent: 'center',
                background: '#ffffff',
                border: '2px solid #9B724C',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)'
              }}>
                <img src={logo} alt="Pinocchio Shop" className="header-logo-img" style={{ height: '150px', width: '150px', objectFit: 'contain' }} />
              </div>
            </Link>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="mobile-cart" style={{ display: 'none' }}>
                <MiniCart />
              </div>
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                style={{ 
                  color: '#111827'
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="nav desktop-nav" style={{ color: '#111827' }}>
            {user && (
              <span style={{ 
                padding: '0.5rem 1rem',
                color: '#111827',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                height: '2.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                fontWeight: 500
              }}>
                {t('welcome')} {user.username}
              </span>
            )}
            <div style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user?.role === 'admin' && (
                <Link 
                  to="/add-product" 
                  className="btn"
                  style={{ 
                    fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', 
                    padding: '0.5rem 1rem',
                    height: '2.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('addProduct')}
                </Link>
              )}
              <MiniCart />
            </div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select">
              <option value="de">DE</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="it">IT</option>
            </select>
            {user ? (
              <button onClick={logout} className="btn">{t('logout')}</button>
            ) : (
              <Link to="/login" className="btn">{t('login')}</Link>
            )}
          </nav>
          {/* Mobile Logo - küçük ve sağda */}
          <div className="mobile-logo" style={{ display: 'none' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                border: '2px solid #9B724C',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)'
              }}>
                <img src={logo} alt="Pinocchio Shop" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="mobile-menu" style={{ background: '#ffffff', zIndex: 101 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ color: '#111827' }}>Menu</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: '#111827', cursor: 'pointer' }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="mobile-nav">
              {user && (
                <div style={{ 
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#111827'
                }}>
                  Welcome {user.username}
                </div>
              )}
              {user?.role === 'admin' && (
                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-start' }}>
                  <Link 
                    to="/add-product" 
                    className="btn"
                    style={{ 
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      height: 'auto',
                      display: 'block',
                      background: '#9B724C',
                      border: '1px solid #9B724C',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                      width: '124px'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('addProduct')}
                  </Link>
                </div>
              )}
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select" style={{ width: '124px', padding: '0.5rem 0.75rem', height: 'auto', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                  <option value="de">DE</option>
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                  <option value="it">IT</option>
                </select>
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
                {user ? (
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn" style={{ color: '#ffffff', background: '#9B724C', border: '1px solid #9B724C', width: '124px', padding: '0.5rem 1rem', height: 'auto', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>{t('logout')}</button>
                ) : (
                  <Link to="/login" className="btn" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', background: '#9B724C', border: '1px solid #9B724C', width: '124px', display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.5rem 1rem', height: 'auto', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>{t('login')}</Link>
                )}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}