import React, { useEffect, useState } from 'react';
import { getProduct, getSeller, postSellerVisit } from '../services/api';

export default function ProductPageInner({ id }) {
  const [p, setP] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    (async () => {
      const prod = await getProduct(id);
      setP(prod);
      if (prod?.seller?.id) setSeller(await getSeller(prod.seller.id));
    })();
  }, [id]);

  if (!p) return <div className="loading">Cargando…</div>;

  const goSeller = async () => {
    if (p?.seller?.id) {
      await postSellerVisit(p.seller.id);
      window.location.href = `/negocio/${p.seller.id}`;
    }
  };

  const goBack = () =>
    window.history.length > 1 ? window.history.back() : (window.location.href = '/');

  const priceLabel =
    typeof p.price === 'number'
      ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p.price)
      : '';

  return (
    <div className="pp-wrap">
      {/* Cinta amarilla con logo centrado */}
      <div className="pp-topbar">
        <img src="/logo.png" alt="Conecta Pinamar" className="pp-logo" />
      </div>

      {/* Título centrado */}
      <h1 className="pp-title">producto</h1>

      {/* Contenido principal */}
      <main className="pp-main">
        <figure className="pp-card">
          <img src={p.imageUrl || '/placeholder.png'} alt={p.name} />
        </figure>

        <div className="pp-price">{priceLabel || '$0000'}</div>

        <div className="pp-actions">
          <button className="pp-btn pp-btn-primary" onClick={goSeller}>
            LO QUIERO!
          </button>
          <button className="pp-btn pp-btn-secondary" onClick={goSeller}>
            Ir a pagina del vendedor
          </button>
        </div>

        {p.description && <p className="pp-desc">{p.description}</p>}

        <button className="pp-back" onClick={goBack}>
          ← volver a la pagina anterior
        </button>
      </main>

      {/* CSS inline */}
      <style>{`
        :root{
          --cp-yellow:#F7D34A;
          --cp-yellow-dark:#e3bf32;
          --cp-text:#111;
          --cp-muted:#6b7280;
          --card-shadow: 0 10px 30px rgba(0,0,0,.15);
        }

        .loading{padding:32px;text-align:center}

        .pp-wrap{
          background:#fff;
          color:var(--cp-text);
          min-height:100dvh;
          display:flex;
          flex-direction:column;
          align-items:center;
        }

        /* TOP BAR AMARILLA */
        .pp-topbar{
          width:100%;
          background:var(--cp-yellow);
          display:flex;
          justify-content:center;
          align-items:center;
          padding:10px 0;
        }
        .pp-logo{

          height:72px;
          display:block;
        }

        /* TÍTULO CENTRADO */
        .pp-title{
          width:100%;
          max-width:960px;
          text-align:center;
          margin:18px 0 8px 0;
          font-size: clamp(32px, 8vw, 56px);
          line-height:1.05;
          font-weight:800;
          text-transform: lowercase;
        }

        /* MAIN */
        .pp-main{
          width:100%;
          max-width:960px;
          padding: 0 12px 40px 12px;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:18px;
        }

        .pp-card{
          margin:8px 0 0 0;
          width:min(560px, 92vw);
          background:#fff;
          border-radius:20px;
          box-shadow: var(--card-shadow);
          overflow:hidden;
        }
        .pp-card img{
          display:block;
          width:100%;
          height:auto;
          aspect-ratio:1/1;
          object-fit:cover;
        }

        .pp-price{
          font-size: clamp(36px, 10vw, 56px);
          font-weight:900;
          letter-spacing:.5px;
        }

        .pp-actions{
          display:flex;
          flex-direction:column;
          gap:12px;
          width:min(480px, 92vw);
        }

        .pp-btn{
          appearance:none;
          border-radius:12px;
          padding:14px 18px;
          font-size: clamp(16px, 3.8vw, 20px);
          font-weight:800;
          cursor:pointer;
          width:100%;
          border:2px solid transparent;
          transition: transform .08s ease, box-shadow .15s ease, background-color .15s ease, color .15s ease, border-color .15s ease;
        }

        /* PRIMARIO: amarillo sólido (sin sombra inset inicial) */
        .pp-btn-primary{
          background: var(--cp-yellow);
          color:#111;
          box-shadow: 0 2px 0 rgba(0,0,0,.08);
        }
        .pp-btn-primary:hover{
          background: var(--cp-yellow-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(0,0,0,.12);
        }
        .pp-btn-primary:active{
          transform: translateY(0);
          box-shadow: 0 1px 0 rgba(0,0,0,.08);
        }

        /* SECUNDARIO: borde amarillo, hover rellena */
        .pp-btn-secondary{
          background:#fff;
          color:#111;
          border-color: var(--cp-yellow);
        }
        .pp-btn-secondary:hover{
          background: var(--cp-yellow);
          color:#111;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(0,0,0,.12);
        }
        .pp-btn-secondary:active{
          transform: translateY(0);
          box-shadow: 0 1px 0 rgba(0,0,0,.08);
        }

        .pp-desc{
          margin:6px 0 0 0;
          color:var(--cp-muted);
          max-width:680px;
          text-align:center;
        }

        .pp-back{
          margin-top:12px;
          background:transparent;
          border:0;
          color:#6b7280;
          font-size:12px;
          cursor:pointer;
        }
        .pp-back:hover{ text-decoration:underline; }

        @media (min-width: 768px){
          .pp-actions{ gap:14px; }
        }
      `}</style>
    </div>
  );
}
