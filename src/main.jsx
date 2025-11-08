// StrictMode removed to avoid double-invocations that feel like refreshes in dev
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { I18nProvider } from './contexts/I18nContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  </BrowserRouter>,
)
