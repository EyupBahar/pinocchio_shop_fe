import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../data/products.js";
import { useCart } from "../contexts/CartContext.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";
import { StarRating } from "../components/StarRating.jsx";
import { productService } from "../services/productService.js";
import { translateText, translateBatch } from "../services/translationService.js";
import { FaAngleDown } from "react-icons/fa";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import bamosCert1 from '../assets/Bamos_zertifikat.png';
import bamosCert2 from '../assets/Bamos_zertifikat_2.png';

export function ProductPage() {
  const { id } = useParams();
  const { t, lang } = useI18n();
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
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  
  // Translated content state
  const [translatedContent, setTranslatedContent] = useState({
    title: null,
    description: null,
    productFeatures: null,
    shipmentFeatures: null,
    deliveryFeatures: null
  });
  const [translating, setTranslating] = useState(false);

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

  // Translate product content when language changes or product loads
  useEffect(() => {
    if (!product || !product.title) return;
    
    const translateProductContent = async () => {
      // First, check if backend already has translations for this language
      const backendTitle = product[`title_${lang}`];
      const backendDescription = product[`description_${lang}`];
      const backendProductFeatures = product[`product_features_${lang}`];
      const backendShipmentFeatures = product[`shipment_features_${lang}`];
      const backendDeliveryFeatures = product[`delivery_features_${lang}`];
      
      // If backend has translations, use them directly (no API calls needed)
      if (backendTitle || backendDescription || 
          (Array.isArray(backendProductFeatures) && backendProductFeatures.length > 0) ||
          (Array.isArray(backendShipmentFeatures) && backendShipmentFeatures.length > 0) ||
          (Array.isArray(backendDeliveryFeatures) && backendDeliveryFeatures.length > 0)) {
        console.log('✅ Using backend translations for language:', lang);
        setTranslatedContent({
          title: backendTitle || null,
          description: backendDescription || null,
          productFeatures: Array.isArray(backendProductFeatures) ? backendProductFeatures : null,
          shipmentFeatures: Array.isArray(backendShipmentFeatures) ? backendShipmentFeatures : null,
          deliveryFeatures: Array.isArray(backendDeliveryFeatures) ? backendDeliveryFeatures : null
        });
        setTranslating(false);
        return;
      }
      
      // Only translate if language is not Turkish (assuming Turkish is the source language)
      if (lang === 'tr') {
        setTranslatedContent({
          title: null,
          description: null,
          productFeatures: null,
          shipmentFeatures: null,
          deliveryFeatures: null
        });
        setTranslating(false);
        return;
      }

      // No backend translations found
      // Only translate if Google Translate API key is available (to avoid MyMemory rate limits)
      const hasGoogleApiKey = !!import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
      
      if (!hasGoogleApiKey) {
        // No Google API key and no backend translations - use original content
        if (import.meta.env.DEV) {
          console.log(`ℹ️ No backend translations found for ${lang} and no Google Translate API key. Using original content.`);
          console.log('💡 Tip: Add VITE_GOOGLE_TRANSLATE_API_KEY to enable runtime translation, or add translations via AddProductPage.');
        }
        setTranslatedContent({
          title: null,
          description: null,
          productFeatures: null,
          shipmentFeatures: null,
          deliveryFeatures: null
        });
        setTranslating(false);
        return;
      }
      
      // Google Translate API key available - translate on-the-fly
      console.log('⚠️ No backend translations found, translating on-the-fly with Google Translate for:', lang);
      setTranslating(true);
      try {
        // Translate title
        const translatedTitle = await translateText(product.title, lang, 'tr');
        
        // Translate description
        let translatedDescription = null;
        if (descriptionText) {
          translatedDescription = await translateText(descriptionText, lang, 'tr');
        }
        
        // Translate features arrays
        const translatedProductFeatures = productFeatures.length > 0
          ? await translateBatch(productFeatures, lang, 'tr')
          : null;
        
        const translatedShipmentFeatures = shipmentFeatures.length > 0
          ? await translateBatch(shipmentFeatures, lang, 'tr')
          : null;
        
        const translatedDeliveryFeatures = deliveryFeatures.length > 0
          ? await translateBatch(deliveryFeatures, lang, 'tr')
          : null;

        setTranslatedContent({
          title: translatedTitle,
          description: translatedDescription,
          productFeatures: translatedProductFeatures,
          shipmentFeatures: translatedShipmentFeatures,
          deliveryFeatures: translatedDeliveryFeatures
        });
      } catch (error) {
        console.error('Translation error:', error);
        // On error, use original content
        setTranslatedContent({
          title: null,
          description: null,
          productFeatures: null,
          shipmentFeatures: null,
          deliveryFeatures: null
        });
      } finally {
        setTranslating(false);
      }
    };

    translateProductContent();
  }, [product, lang, descriptionText, productFeatures, shipmentFeatures, deliveryFeatures]);

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

  // Use translated content if available, otherwise use original
  const displayTitle = translatedContent.title || product?.title || '';
  const displayDescription = translatedContent.description || descriptionText || '';
  const displayProductFeatures = translatedContent.productFeatures || productFeatures || [];
  const displayShipmentFeatures = translatedContent.shipmentFeatures || shipmentFeatures || [];
  const displayDeliveryFeatures = translatedContent.deliveryFeatures || deliveryFeatures || [];
  
  const descriptionItems = displayDescription ? parseDescription(displayDescription) : null;

  // Prepare images array (main image + additional images)
  const mainImage = product?.image || product?.imageUrl || product?.picture;
  const additionalImages = product?.images || [];
  const allImages = [mainImage, ...additionalImages].filter(Boolean);

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
          {allImages.length > 1 ? (
            <div style={{ width: '100%' }}>
              {/* Main Slider */}
              <Swiper
                spaceBetween={10}
                navigation={true}
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[Navigation, Pagination, Thumbs]}
                className="product-image-swiper"
                style={{
                  width: '100%',
                  height: 'auto',
                  marginBottom: '1rem'
                }}
              >
                {allImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={img}
                      alt={`${displayTitle || product?.title || 'Product'} - ${index + 1}`}
                      className="product-page-image"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/1200x900?text=Image";
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Thumbnails Slider */}
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                navigation={allImages.length > 4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[Thumbs, Navigation]}
                className="product-thumbs-swiper"
                style={{
                  width: '100%',
                  height: 'auto'
                }}
              >
                {allImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={img}
                      alt={`${displayTitle || product?.title || 'Product'} thumbnail ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        transition: 'border-color 0.2s'
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/150x100?text=Image";
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <img
              src={mainImage}
              alt={displayTitle || product?.title || 'Product'}
              className="product-page-image"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/1200x900?text=Image";
              }}
            />
          )}
        </div>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 6vw, 2.75rem)", fontWeight: 700, margin: 0 }}>
            {translating ? '...' : displayTitle}
          </h1>
          {product?.rating && product.rating > 0 && (
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
                <span>{t('productFeatures')}</span>
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
                    {displayProductFeatures.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: '#111827' }}>
                        {translating ? '...' : feature}
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
                <span>{t('shipmentFeatures')}</span>
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
                    {displayShipmentFeatures.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: '#111827' }}>
                        {translating ? '...' : feature}
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
                <span>{t('deliveryFeatures')}</span>
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
                    {displayDeliveryFeatures.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.6', color: '#111827' }}>
                        {translating ? '...' : feature}
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
              {product?.variants?.map((v) => (
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
                if (!product?.id) return;
                const finalVariantId = variantId || product?.variants?.[0]?.id || 'std';
                if (inCart) {
                  updateQuantity(product.id, finalVariantId, quantity);
                } else {
                  addItem(product, finalVariantId, quantity);
                }
              }}
              className="btn btn-primary"
              disabled={!product?.id}
            >
              {inCart ? t("updateCart") : t("addToCart")} — CHF {((product?.price || 0) * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* BAMOS Certificate for Canakkale Domates - Separate Section */}
      {(product?.title?.toLowerCase().includes('canakkale') || product?.title?.toLowerCase().includes('domates')) && (
        <div style={{ marginTop: '3rem', width: '100%' }}>
          <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
            BAMOS Zertifikat
          </h3>
          <div className="bamos-certificates-grid">
            <div style={{
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: '#fff'
            }}>
              <img
                src={bamosCert1}
                alt="BAMOS Zertifikat 1"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
                loading="lazy"
              />
            </div>
            <div style={{
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              background: '#fff'
            }}>
              <img
                src={bamosCert2}
                alt="BAMOS Zertifikat 2"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
