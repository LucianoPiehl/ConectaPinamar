import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryProducts } from '../services/api';
import SearchBarUnified from '../components/SearchBarUnified';

export default function CategoryPage() {
  const { id } = useParams();
  const [cat, setCat] = useState(null);
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const goBack = () =>
    window.history.length > 1 ? window.history.back() : (window.location.href = '/');
  // productos de la categoría
  useEffect(() => {
    (async () => {
      const prods = await getCategoryProducts(id);
      setItems(prods || []);
      setFiltered(prods || []); // inicializamos el listado visible
    })();
  }, [id]);

  // datos de la categoría (para título + banner)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        const all = await res.json();
        const c = (all || []).find((x) => String(x.id) === String(id));
        setCat(c || null);
      } catch {
        setCat(null);
      }
    })();
  }, [id]);

  const priceFmt = (n) =>
    typeof n === 'number' ? n.toLocaleString('es-AR') : '';

  const banner = cat?.imageBanner || cat?.imageUrl || '';

  return (
    <div className="cp-cat page">
      {/* Banner */}
      <section
        className="hero"
        style={banner ? { backgroundImage: `url(${banner})` } : {}}
        aria-label={cat?.name || `Categoría #${id}`}
      >
        <div className="hero-layer">
          {/* Banda amarilla translúcida (50%) detrás del logo (logo sin opacidad) */}
          <div className="brand-badge">
            <img src="/logo.png" id="logoc" alt="Conecta Pinamar" className="brand-logo" />
          </div>

          <h1 className="title">{(cat?.name || 'Categoría').toUpperCase()}</h1>

          {/* Buscador reutilizado en modo LOCAL (filtra sólo los productos de esta categoría) */}
          <div className="search-holder">
            <SearchBarUnified
              placeholder="Buscar ofertas, productos, comercios y más"
              scopeItems={items}
              onScopedChange={(list /*, term */) => setFiltered(list)}
              showPanel={false}
            />
          </div>
        </div>
      </section>

      {/* Grilla de productos */}
      <div className="grid">
        {filtered.map((p) => (
          <a key={p.id} className="card" href={`/producto/${p.id}`}>
            <div className="thumb">
              <img src={p.imageUrl} alt={p.name} loading="lazy" />
            </div>
            <div className="meta">
              <div className="name">{p.name || 'producto'}</div>
              <div className="price">
                {typeof p.price !== 'undefined' ? `$ ${priceFmt(p.price)}` : '$'}
              </div>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="empty">
            {items.length ? 'Sin resultados.' : 'No hay productos en esta categoría.'}
          </div>
        )}

      </div>
        <button className="pp-back" onClick={goBack}>
          ← volver a la pagina anterior
        </button>
      <style>{`
        .cp-cat{
          --yellow:#F7D34A;
          --ink:#111;
          --card:#fff;
          --border:#e6e6e6;
          --shadow:0 8px 24px rgba(0,0,0,.08);
        }

        .hero{
          position:relative; width:100%;
          min-height:260px;
          background:#ddd center/cover no-repeat;
          display:grid; place-items:center;
          padding:20px 16px 64px;
        }
        .hero::after{
          content:""; position:absolute; inset:0;
          background:linear-gradient(180deg, rgba(0,0,0,.20), rgba(0,0,0,.35));
        }
        .hero-layer{
          position:relative; z-index:1;
          width:100%; max-width:1100px;
          display:flex; flex-direction:column;
          align-items:center; gap:12px;
        }

        /* Fondo amarillo al 50% detrás del logo */
        .brand-badge{
          background:rgba(247, 211, 74, 0.5);
          border-radius:10px;
          padding:6px 10px;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 18px rgba(0,0,0,.15);
          height:72px;
        }
        #logoc{height:72px;}
        .brand-logo{ height:72px; display:block; }

        .title{
          margin:0;
          color:#fff;
          text-align:center;
          text-shadow:0 2px 8px rgba(0,0,0,.35);
          font:800 32px/1.05 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;
          letter-spacing:.5px;
        }

        .search-holder{ width:100%; max-width:700px; margin-top:4px; }

        .grid{
          max-width:1100px; margin:24px auto; padding:0 16px 32px;
          display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:18px;
        }
        .card{
          display:flex; flex-direction:column;
          background:var(--card); border:1px solid var(--border);
          border-radius:16px; text-decoration:none; color:var(--ink);
          box-shadow:var(--shadow);
          transition:transform .12s ease, box-shadow .12s ease;
        }
        .card:hover{ transform:translateY(-2px); box-shadow:0 10px 26px rgba(0,0,0,.12); }
        .thumb{ aspect-ratio:1/1; width:100%; overflow:hidden; border-top-left-radius:16px; border-top-right-radius:16px; }
        .thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
        .meta{ padding:10px 12px 12px; }
        .name{ font-weight:800; font-size:18px; line-height:1.1; margin:0 0 6px 0; }
        .price{ font-weight:900; font-size:20px; }
        .empty{ grid-column:1 / -1; text-align:center; color:#666; padding:24px 0; }

        @media (min-width:900px){
          .hero{ min-height:320px; padding:28px 16px 90px; }
          .brand-logo{ height:24px; }
          .title{ font-size:40px; }
          .grid{ gap:22px; }
          .name{ font-size:20px; }
          .price{ font-size:22px; }
        }

        .pp-back{
          display:block;                /* bloque, no inline-flex */
          width:fit-content;            /* ocupa lo que necesita */
          /* si querés máxima compatibilidad:
             width:-moz-fit-content; width:fit-content; */
          margin:16px auto 28px;        /* ← centra horizontalmente */
          padding:0;

          background:transparent;
          border:0;
          color:#6b7280;
          font-size:12px;
          cursor:pointer;
        }
        .pp-back:hover{ text-decoration:underline; }



      `}</style>
    </div>
  );
}
