import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSeller, getSellerProducts } from '../services/api';

const numberFrom = (...values) => {
  for (const value of values) {
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const firstValue = (obj, keys = []) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key]) return obj[key];
  }
  return undefined;
};

const formatPrice = (value) => {
  if (typeof value !== 'number') return '';
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
  } catch (err) {
    console.error(err);
    return `$ ${value}`;
  }
};

export default function SellerPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const sData = await getSeller(id);
        if (!isMounted) return;
        setSeller(sData);
        const prodData = await getSellerProducts(id);
        if (!isMounted) return;
        setProducts(prodData || []);
      } catch (error) {
        console.error('SellerPage load failed', error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const goBack = () =>
    window.history.length > 1 ? window.history.back() : (window.location.href = '/');

  const mapData = useMemo(() => {
    if (!seller) return { hasCoords: false };
    const lat = numberFrom(
      seller.latitude,
      seller.lat,
      seller.geoLat,
      seller.geoLatitude,
      seller.locationLat,
      seller.locationLatitude
    );
    const lng = numberFrom(
      seller.longitude,
      seller.lng,
      seller.geoLng,
      seller.geoLongitude,
      seller.locationLng,
      seller.locationLongitude
    );
    if (lat === null || lng === null) return { hasCoords: false };
    return {
      hasCoords: true,
      lat,
      lng,
      embedUrl: `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    };
  }, [seller]);

  const socialLinks = useMemo(() => {
    if (!seller) return [];
    const phone = seller.contactPhone ? seller.contactPhone.replace(/[^0-9+]/g, '') : '';
    const waFallback = phone.length >= 6 ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : null;
    return [
      { id: 'facebook', label: 'Facebook', href: firstValue(seller, ['facebookUrl']) },
      { id: 'instagram', label: 'Instagram', href: firstValue(seller, ['instagramUrl']) },
      { id: 'whatsapp', label: 'Whatsapp', href: firstValue(seller, ['whatsappUrl']) || waFallback }
    ].filter((item) => !!item.href);
  }, [seller]);

  const SOCIAL_ICONS = {
    facebook: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21h-3v-7.5H8v-2.9h2.5V8.2c0-2.4 1.4-3.8 3.6-3.8 1 .01 2 .07 3 .18v2.7h-1.8c-1.4 0-1.7.7-1.7 1.6v1.7h3.4l-.4 2.9h-3v7.6z"/></svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 3h10c2.2 0 4 1.8 4 4v10c0 2.2-1.8 4-4 4H7c-2.2 0-4-1.8-4-4V7c0-2.2 1.8-4 4-4zm0 2c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H7zm11 1.5a1 1 0 110 2 1 1 0 010-2zM12 8a4 4 0 110 8 4 4 0 010-8zm0 2.3a1.7 1.7 0 100 3.4 1.7 1.7 0 000-3.4z"/>
      </svg>
    ),
    whatsapp: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 3a9 9 0 00-7.8 13.5L3 21l4.7-1.2A9 9 0 1012 3zm0 2a7 7 0 014.95 11.95l-.3.3-.4-.1a6.3 6.3 0 00-2.27-.36c-3.6 0-6.52-2.92-6.52-6.52 0-.78.14-1.54.41-2.26l.14-.4.28-.3A6.99 6.99 0 0112 5zm-3.1 2.8c-.18 0-.45.05-.68.37-.23.32-.89.87-.89 2.09s.91 2.43 1.04 2.6c.14.18 1.79 2.84 4.37 3.86 2.16.85 2.6.68 3.07.66.47-.02 1.51-.62 1.72-1.2.21-.58.21-1.08.15-1.18-.06-.11-.23-.18-.47-.32-.24-.14-1.51-.74-1.75-.82-.24-.1-.42-.14-.6.14-.18.27-.7.82-.86.99-.16.16-.32.18-.6.05-.29-.13-1.21-.44-2.31-1.39-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.12-.59.12-.12.29-.31.43-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.13-.6-1.45-.82-1.98-.21-.52-.43-.48-.6-.48z"/>
      </svg>
    )
  };

  if (!seller) return <div className="loading">Cargando…</div>;

  const bannerImage =
    seller.imageUrl ||
    seller.bannerImageUrl ||
    seller.coverImageUrl ||
    seller.coverUrl ||
    seller.imageBanner ||
    '/placeholder.png';

  return (
    <div className="cp-seller-page page">
      <section
        className="seller-hero"
        style={{ backgroundImage: bannerImage ? `url("${bannerImage}")` : undefined }}
        aria-label={`Banner de ${seller.name}`}
      >
        <div className="seller-hero__center">
          <div className="seller-hero__plate">
            <img src="/logo.png" alt="Conecta Pinamar" className="seller-hero__logo" />
          </div>
        </div>
      </section>

      <section className="seller-heading">
        <h1 className="seller-heading__title">{seller.name}</h1>
      </section>

      <section className="seller-products">
        <h2>Productos del vendedor</h2>
        <div className="seller-products__grid">
          {products.map((product) => (
            <a key={product.id} className="seller-product" href={`/producto/${product.id}`}>
              <div className="seller-product__thumb">
                <img src={product.imageUrl || '/placeholder.png'} alt={product.name} loading="lazy" />
              </div>
              <div className="seller-product__info">
                <div className="seller-product__name">{product.name}</div>
                {product.price != null && (
                  <div className="seller-product__price">{formatPrice(product.price)}</div>
                )}
              </div>
            </a>
          ))}
          {products.length === 0 && (
            <div className="seller-products__empty">Este vendedor todavía no cargó productos.</div>
          )}
        </div>
      </section>

      <section className="seller-location">
        <h2>Ubicación</h2>
        {mapData.hasCoords ? (
          <div className="seller-location__map">
            <iframe
              title={`Ubicación de ${seller.name}`}
              src={mapData.embedUrl}
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="seller-location__placeholder">El vendedor todavía no cargó su ubicación.</p>
        )}
      </section>

      <section className="seller-more">
        <h2>Saber más</h2>
        {socialLinks.length ? (
          <div className="seller-more__actions">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                className={`seller-social seller-social--${link.id}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                {SOCIAL_ICONS[link.id]}
              </a>
            ))}
          </div>
        ) : (
          <p className="seller-more__placeholder">El vendedor no agregó enlaces a redes sociales.</p>
        )}
      </section>

      <button className="seller-back" onClick={goBack}>
        ← volver a la pagina anterior
      </button>
    </div>
  );
}
