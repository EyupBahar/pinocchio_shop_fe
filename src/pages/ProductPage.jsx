import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../data/products.js";
import { useCart } from "../contexts/CartContext.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";
import { StarRating } from "../components/StarRating.jsx";
import { productService } from "../services/productService.js";
import { FaAngleDown } from "react-icons/fa";

export function ProductPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const fallbackProduct = useMemo(() => getProductById(id), [id]);
  const { addItem, items, updateQuantity } = useCart();
  const [apiProduct, setApiProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState(undefined);
  const [quantity, setQuantity] = useState(1);
  const [openDropdown, setOpenDropdown] = useState({
    productFeatures: false,
    shipmentFeatures: false,
    deliveryFeatures: false
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await productService.getById(id);
        const data = res?.data?.data || res?.data || null;
        if (!mounted) return;
        setApiProduct(data);
        const firstVariant = data?.variants?.[0]?.id;
        setVariantId(firstVariant);
      } catch (e) {
        console.error('Product fetch error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  const product = apiProduct || fallbackProduct;

  // Extract features from product (can be in features object or root level)
  const features = product?.features || {};
  const productFeatures = features.product_features || product?.product_features || [];
  const shipmentFeatures = features.shipment_features || product?.shipment_features || [];
  const deliveryFeatures = features.delivery_features || product?.delivery_features || [];
  const descriptionText = features.description || product?.description || '';

  // Parse description to split numbered items into separate lines
  const parseDescription = (desc) => {
    if (!desc) return null;
    // Match pattern: "1. ", "2. ", "3. " etc. - split at these points
    // Regex: (\d+\.\s) captures the number with period and space
    const parts = desc.split(/(?=\d+\.\s)/);
    return parts
      .filter(part => part.trim())
      .map(part => {
        const match = part.match(/^(\d+\.\s)(.*)$/);
        if (match) {
          return { number: match[1], text: match[2].trim() };
        }
        return { number: '', text: part.trim() };
      });
  };

  const descriptionItems = descriptionText ? parseDescription(descriptionText) : null;

  // Sepette bu ürünün olup olmadığını kontrol et
  const currentVariantId = variantId || product?.variants?.[0]?.id || 'std';
  const inCart = product?.id ? items.find((i) => i.id === product.id && i.variantId === currentVariantId) : null;

  // Ürün sepete eklendiğinde veya variant değiştiğinde quantity'yi sepetteki miktara göre ayarla
  // Sadece sepetteki miktar değiştiğinde ve quantity state'i farklıysa güncelle
  useEffect(() => {
    if (!product?.id) return;
    if (inCart && inCart.quantity !== quantity) {
      // Sadece sepetteki miktar quantity state'inden farklıysa güncelle
      // Bu, başka bir yerden sepetteki miktar değiştiğinde çalışır
      setQuantity(inCart.quantity);
    } else if (!inCart && quantity !== 1) {
      // Eğer ürün sepette değilse ve quantity 1 değilse, 1'e sıfırla
      setQuantity(1);
    }
  }, [inCart?.quantity, currentVariantId, product?.id, quantity]); // Sadece sepetteki miktar veya variant değiştiğinde

  const toggleDropdown = (type) => {
    setOpenDropdown(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (loading) {
    return <div className="container section">{t("loading")}</div>;
  }

  if (!product) {
    return <div className="container py-16">{t("notFound")}</div>;
  }

  return (
    <div className="container section">
      <div className="product-layout">
        <div style={{ borderRadius: ".5rem", overflow: "hidden" }}>
          <img
            src={product.image || product.imageUrl || product.picture}
            alt={product.title}
            className="product-page-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/1200x900?text=Image";
            }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 6vw, 2.75rem)", fontWeight: 700, margin: 0 }}>
            {product.title}
          </h1>
          {product.rating && product.rating > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <StarRating rating={product.rating} showValue={true} />
            </div>
          )}
          {descriptionItems && (
            <div className="text-muted" style={{ marginTop: ".75rem", lineHeight: "1.8" }}>
              {descriptionItems.map((item, idx) => (
                <div key={idx} style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 700 }}>{item.number}</span>{item.text}
                </div>
              ))}
            </div>
          )}

          {/* Product Features Dropdown */}
          {productFeatures.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => toggleDropdown('productFeatures')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  fontWeight: 500
                }}
              >
                <span>Product Features</span>
                <span style={{ transition: 'transform 0.2s', transform: openDropdown.productFeatures ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex', alignItems: 'center' }}>
                  <FaAngleDown />
                </span>
              </button>
              {openDropdown.productFeatures && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: '#ffffff',
                  borderTop: '2px solid #e5e7eb',
                  borderBottom: '2px solid #e5e7eb',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: '0'
                }}>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyle: 'disc', color: '#111827' }}>
                    {productFeatures.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: '#111827' }}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Shipment Features Dropdown */}
          {shipmentFeatures.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => toggleDropdown('shipmentFeatures')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  fontWeight: 500
                }}
              >
                <span>Shipment Features</span>
                <span style={{ transition: 'transform 0.2s', transform: openDropdown.shipmentFeatures ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex', alignItems: 'center' }}>
                  <FaAngleDown />
                </span>
              </button>
              {openDropdown.shipmentFeatures && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: '#ffffff',
                  borderTop: '2px solid #e5e7eb',
                  borderBottom: '2px solid #e5e7eb',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: '0'
                }}>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyle: 'disc', color: '#111827' }}>
                    {shipmentFeatures.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: '#111827' }}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Delivery Features Dropdown */}
          {deliveryFeatures.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => toggleDropdown('deliveryFeatures')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  fontWeight: 500
                }}
              >
                <span>Delivery Features</span>
                <span style={{ transition: 'transform 0.2s', transform: openDropdown.deliveryFeatures ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex', alignItems: 'center' }}>
                  <FaAngleDown />
                </span>
              </button>
              {openDropdown.deliveryFeatures && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: '#ffffff',
                  borderTop: '2px solid #e5e7eb',
                  borderBottom: '2px solid #e5e7eb',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: '0'
                }}>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyle: 'disc', color: '#111827' }}>
                    {deliveryFeatures.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: '#111827' }}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <div
              className="text-muted"
              style={{ fontSize: "clamp(0.75rem, 2vw, 0.9rem)", marginBottom: ".5rem" }}
            >
              {t("size")}
            </div>
            <div className="product-variants">
              {product.variants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`pill${variantId === v.id ? " active" : ""}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: ".75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  const newQuantity = Math.max(1, quantity - 1);
                  setQuantity(newQuantity);
                  if (inCart) {
                    updateQuantity(product.id, currentVariantId, newQuantity);
                  }
                }}
                className="btn"
                style={{
                  minWidth: "2.5rem",
                  height: "2.5rem",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)"
                }}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const newQuantity = Math.max(1, Number(e.target.value));
                  setQuantity(newQuantity);
                  if (inCart) {
                    updateQuantity(product.id, currentVariantId, newQuantity);
                  }
                }}
                className="qty"
                style={{ textAlign: "center", width: "4rem" }}
              />
              <button
                onClick={() => {
                  const newQuantity = quantity + 1;
                  setQuantity(newQuantity);
                  if (inCart) {
                    updateQuantity(product.id, currentVariantId, newQuantity);
                  }
                }}
                className="btn"
                style={{
                  minWidth: "2.5rem",
                  height: "2.5rem",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)"
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                const finalVariantId = variantId || product?.variants?.[0]?.id || 'std';
                if (inCart) {
                  updateQuantity(product.id, finalVariantId, quantity);
                } else {
                  addItem(product, finalVariantId, quantity);
                }
              }}
              className="btn btn-primary"
            >
              {inCart ? t("updateCart") : t("addToCart")} — CHF {(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
