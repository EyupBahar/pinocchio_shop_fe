import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { MdOutlineShoppingCart, MdAssignmentAdd, MdLanguage } from "react-icons/md"
import { FaUserAlt, FaClipboardList } from "react-icons/fa"
import logo from '../assets/neu_logo.svg'
import centerLogo from '../assets/center_logo.svg'

export function Header() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const { lang, setLang, t } = useI18n()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  
  const handleLogout = () => {
    logout()
    toast.success(t('loggedOut'), {
      position: 'top-right',
      autoClose: 3000,
    })
  }
  
  const languages = [
    { code: 'de', label: 'DE' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'it', label: 'IT' }
  ]


  return (
    <>
      <header className="header" style={{ background: '#ffffff', boxShadow: undefined }}>
        <div className="container header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <Link to="/" className="site-title" style={{ background: '#ffffff' }}>
              <div className="header-logo" style={{
                width: '60px',
                height: '60px',
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
                <img src={logo} alt="Pinocchio Shop" className="header-logo-img" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
              </div>
            </Link>
            <img 
              src={centerLogo} 
              alt="Center Logo" 
              className="center-logo"
              style={{ 
                height: '200px', 
                width: 'auto', 
                objectFit: 'contain',
                margin: '0 1rem'
              }} 
            />
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <nav className="nav desktop-nav" style={{ color: '#111827', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <>
                <div style={{ position: 'relative' }}>
                  <Link 
                    to="/my-orders" 
                    style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9B724C',
                      fontSize: '2.25rem',
                      textDecoration: 'none',
                      padding: '0.5rem'
                    }}
                    aria-label={t('myOrdersLink')}
                    onMouseEnter={(e) => {
                      const tooltip = e.currentTarget.nextSibling
                      if (tooltip) tooltip.style.display = 'block'
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.nextSibling
                      if (tooltip) tooltip.style.display = 'none'
                    }}
                  >
                    <FaClipboardList />
                  </Link>
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: '#111827',
                      color: '#ffffff',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      display: 'none',
                      zIndex: 1000,
                      pointerEvents: 'none'
                    }}
                  >
                    {t('myOrdersLink')}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '6px solid #111827'
                      }}
                    />
                  </div>
                </div>
              </>
            )}
            <div style={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {(user?.role === 'admin' || user?.role === 'Admin') && (
                <div style={{ position: 'relative' }}>
                  <Link 
                    to="/add-product" 
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9B724C',
                      fontSize: '2.25rem',
                      textDecoration: 'none',
                      padding: '0.5rem'
                    }}
                    aria-label={t('addProduct')}
                    onMouseEnter={(e) => {
                      const tooltip = e.currentTarget.nextSibling
                      if (tooltip) tooltip.style.display = 'block'
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.nextSibling
                      if (tooltip) tooltip.style.display = 'none'
                    }}
                  >
                    <MdAssignmentAdd />
                  </Link>
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: '#111827',
                      color: '#ffffff',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      display: 'none',
                      zIndex: 1000,
                      pointerEvents: 'none'
                    }}
                  >
                    {t('addProduct')}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '6px solid #111827'
                      }}
                    />
                  </div>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <Link 
                  to="/cart" 
                  style={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9B724C',
                    fontSize: '2.25rem',
                    textDecoration: 'none',
                    padding: '0.5rem'
                  }}
                  aria-label={t('cart')}
                  onMouseEnter={(e) => {
                    const tooltip = e.currentTarget.nextSibling
                    if (tooltip) tooltip.style.display = 'block'
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.nextSibling
                    if (tooltip) tooltip.style.display = 'none'
                  }}
                >
                  <MdOutlineShoppingCart />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: '#111827',
                    color: '#ffffff',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    display: 'none',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  {t('cart')}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '6px solid #111827'
                    }}
                  />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9B724C',
                  fontSize: '2.25rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
                aria-label="Select language"
                onMouseEnter={(e) => {
                  const tooltip = e.currentTarget.nextSibling
                  if (tooltip && !isLangMenuOpen) tooltip.style.display = 'block'
                }}
                onMouseLeave={(e) => {
                  const tooltip = e.currentTarget.nextSibling
                  if (tooltip) tooltip.style.display = 'none'
                }}
              >
                <MdLanguage />
              </button>
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: '#111827',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  display: 'none',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}
              >
                {t('language') || 'Language'}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid #111827'
                  }}
                />
              </div>
              {isLangMenuOpen && (
                <>
                  <div 
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 100
                    }}
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 101,
                    minWidth: '100px'
                  }}>
                    {languages.map((lng) => (
                      <button
                        key={lng.code}
                        onClick={() => {
                          setLang(lng.code)
                          setIsLangMenuOpen(false)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          textAlign: 'left',
                          background: lang === lng.code ? '#f3f4f6' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: lang === lng.code ? '#9B724C' : '#111827',
                          fontWeight: lang === lng.code ? 600 : 400
                        }}
                      >
                        {lng.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              {user ? (
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9B724C',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    gap: '0.25rem'
                  }}
                  aria-label={t('logout')}
                  onMouseEnter={(e) => {
                    const tooltip = e.currentTarget.nextSibling
                    if (tooltip) tooltip.style.display = 'block'
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.nextSibling
                    if (tooltip) tooltip.style.display = 'none'
                  }}
                >
                  <FaUserAlt style={{ fontSize: '1.5rem' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    Hallo {user.username}
                  </span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9B724C',
                    textDecoration: 'none',
                    padding: '0.5rem',
                    gap: '0.25rem'
                  }}
                  aria-label={t('login')}
                  onMouseEnter={(e) => {
                    const tooltip = e.currentTarget.nextSibling
                    if (tooltip) tooltip.style.display = 'block'
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.nextSibling
                    if (tooltip) tooltip.style.display = 'none'
                  }}
                >
                  <FaUserAlt style={{ fontSize: '1.5rem' }} />
                </Link>
              )}
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: '#111827',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  display: 'none',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}
              >
                {user ? t('logout') : t('login')}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid #111827'
                  }}
                />
              </div>
            </div>
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
                <>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}>
                    <Link 
                      to="/my-orders" 
                      style={{ 
                        color: '#9B724C',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                        fontWeight: 500
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaClipboardList style={{ fontSize: '1.5rem' }} />
                      <span>{t('myOrdersLink')}</span>
                    </Link>
                </div>
                </>
              )}
              {(user?.role === 'admin' || user?.role === 'Admin') && (
                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-start' }}>
                  <Link 
                    to="/add-product" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9B724C',
                      fontSize: '1.5rem',
                      textDecoration: 'none',
                      padding: '0.5rem'
                    }}
                    aria-label={t('addProduct')}
                  >
                    <MdAssignmentAdd />
                  </Link>
                </div>
              )}
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-start', position: 'relative' }}>
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9B724C',
                    fontSize: '1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                  aria-label="Select language"
                >
                  <MdLanguage />
                </button>
                {isLangMenuOpen && (
                  <>
                    <div 
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100
                      }}
                      onClick={() => setIsLangMenuOpen(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '1rem',
                      marginTop: '0.5rem',
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      zIndex: 101,
                      minWidth: '100px'
                    }}>
                      {languages.map((lng) => (
                        <button
                          key={lng.code}
                          onClick={() => {
                            setLang(lng.code)
                            setIsLangMenuOpen(false)
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.5rem 1rem',
                            textAlign: 'left',
                            background: lang === lng.code ? '#f3f4f6' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: lang === lng.code ? '#9B724C' : '#111827',
                            fontWeight: lang === lng.code ? 600 : 400
                          }}
                        >
                          {lng.label}
                        </button>
                      ))}
                </div>
                  </>
                )}
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
                {user ? (
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                    style={{ 
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      color: '#9B724C',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      gap: '0.5rem'
                    }}
                    aria-label={t('logout')}
                  >
                    <FaUserAlt style={{ fontSize: '1.5rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      Hallo {user.username}
                    </span>
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    style={{ 
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      color: '#9B724C',
                      textDecoration: 'none',
                      padding: '0.5rem',
                      gap: '0.5rem'
                    }}
                    aria-label={t('login')}
                  >
                    <FaUserAlt style={{ fontSize: '1.5rem' }} />
                  </Link>
                )}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}