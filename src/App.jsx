import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ShopPage } from './pages/ShopPage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { EditOrderPage } from './pages/EditOrderPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { OrderDetailsPage } from './pages/OrderDetailsPage.jsx'
import { MyOrdersPage } from './pages/MyOrdersPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { AddProductPage } from './pages/AddProductPage.jsx'
import { DatenschutzPage } from './pages/DatenschutzPage.jsx'
import { ImpressumPage } from './pages/ImpressumPage.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
import { useI18n } from './contexts/I18nContext.jsx'

function App() {
  const { isLoading } = useAuth()
  const { t } = useI18n()

  return (
    <div className="app">
      <Header />
      <main className="main">
        {isLoading ? (
          <div className="container section" style={{ textAlign: 'center' }}>{t('loading')}</div>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/order/:id/edit" element={<EditOrderPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/add-product/:id" element={<AddProductPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
