import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { searchAll } from '../services/api';

/**
 * SearchBarUnified
 * - Modo GLOBAL (default): consulta backend y muestra dropdown.
 * - Modo LOCAL: si pasás `scopeItems`, NO consulta backend; filtra y llama a `onScopedChange(filtered, term)`.
 *
 * Props:
 * - placeholder?: string
 * - scopeItems?: any[]
 * - onScopedChange?: (items, term) => void
 * - showPanel?: boolean   // en local suele ir false
 * - className?: string
 */
export default function SearchBarUnified({
  placeholder = 'Buscar productos, categorías y negocios',
  scopeItems,
  onScopedChange,
  showPanel = true,
  className = '',
}) {
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q, 250);
  const [combined, setCombined] = useState([]);

  // Mantener onScopedChange estable sin ponerlo en deps
  const onScopedChangeRef = useRef(onScopedChange);
  useEffect(() => { onScopedChangeRef.current = onScopedChange; }, [onScopedChange]);

  // Normalizador (estable)
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

  // Filtro local memoizado sólo por scopeItems
  const filterLocal = useMemo(() => {
    if (!Array.isArray(scopeItems)) return () => [];
    return (term) => {
      const t = norm(term).trim();
      if (!t) return scopeItems;
      return scopeItems.filter((p) => {
        const name = norm(p?.name);
        const desc = norm(p?.description);
        const seller = norm(p?.seller?.name);
        return name.includes(t) || desc.includes(t) || seller.includes(t);
      });
    };
  }, [scopeItems]);

  // ---- Efecto MODO LOCAL (sin llamadas remotas)
  useEffect(() => {
    if (!Array.isArray(scopeItems)) return; // no es local
    const filtered = filterLocal(debounced);
    // no mostramos dropdown global en modo local
    if (combined.length) setCombined([]);
    if (typeof onScopedChangeRef.current === 'function') {
      onScopedChangeRef.current(filtered, debounced);
    }
  }, [debounced, scopeItems, filterLocal]); // <-- deps estables

  // ---- Efecto MODO GLOBAL (con backend)
  useEffect(() => {
    if (Array.isArray(scopeItems)) return; // no es global

    const term = debounced.trim();
    if (!term) {
      if (combined.length) setCombined([]);
      return;
    }

    const ac = new AbortController(); // controlador local al efecto
    (async () => {
      try {
        const data = await searchAll(term, ac.signal);
        const cap = 8;
        const arr = [];
        for (const it of data.products || []) { if (arr.length < cap) arr.push({ type: 'product',  ...it }); }
        for (const it of data.categories || []){ if (arr.length < cap) arr.push({ type: 'category', ...it }); }
        for (const it of data.sellers || [])   { if (arr.length < cap) arr.push({ type: 'seller',   ...it }); }
        setCombined(arr);
      } catch (e) {
        // Ignorar aborts/cancels; loguear otros errores opcionalmente
        if (e?.name !== 'AbortError' && e?.message !== 'canceled') {
          // console.warn('[SearchBarUnified] search error:', e);
        }
      }
    })();

    return () => ac.abort();
  }, [debounced, scopeItems]); // NOTA: no dependemos de ningún controller inestable

  const onSubmit = (e) => e.preventDefault();

  return (
    <form className={`cp-search-wrap ${className}`} onSubmit={onSubmit}>
      <input
        className="cp-search-input"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        aria-label="Buscar"
      />
      <button className="cp-search-btn" type="submit" aria-label="Buscar">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {showPanel && !!combined.length && !Array.isArray(scopeItems) && (
        <div className="cp-search-panel">
          {combined.map((item) => (
            <a
              key={`${item.type}-${item.id}`}
              href={
                item.type === 'product'
                  ? `/producto/${item.id}`
                  : item.type === 'category'
                  ? `/categoria/${item.id}`
                  : `/negocio/${item.id}`
              }
              className="cp-search-item"
            >
              <img
                className="thumb"
                src={item.imageUrl || item.image || '/placeholder.png'}
                alt=""
              />
              <span
                className={
                  item.type === 'category' ? 'b' : item.type === 'seller' ? 'i' : ''
                }
              >
                {item.name}
              </span>
            </a>
          ))}
        </div>
      )}

      <style>{`
        .cp-search-wrap{
          position:relative; width:100%;
          display:flex; align-items:center;
          background:#fff;
          border:2px solid #F7D34A;
          border-radius:999px;
          padding:6px;
          box-shadow:0 4px 18px rgba(0,0,0,.1);
          gap:6px;
        }
        .cp-search-input{
          flex:1; border:0; outline:none; background:transparent;
          font-size:14px; padding:8px 10px; color:#111;
        }
        .cp-search-btn{
          display:grid; place-items:center;
          border:0; outline:none; cursor:pointer;
          background:#F7D34A; color:#000; border-radius:999px;
          width:38px; height:38px;
          transition:transform .08s ease, box-shadow .15s ease;
        }
        .cp-search-btn:hover{ transform:translateY(-1px); box-shadow:0 6px 14px rgba(0,0,0,.18); }
        .cp-search-btn:active{ transform:translateY(0); box-shadow:none; }

        .cp-search-panel{
          position:absolute; left:0; right:0; top:calc(100% + 8px);
          background:#fff; border:1px solid #ececec; border-radius:14px;
          box-shadow:0 14px 32px rgba(0,0,0,.18); overflow:hidden; z-index:5;
          max-height:340px; overflow-y:auto;
          animation:cpSearchReveal .22s cubic-bezier(.22,.61,.36,1);
        }
        .cp-search-item{
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; text-decoration:none; color:#111;
          animation:cpSearchItem .28s ease both;
        }
        .cp-search-item:nth-child(2){ animation-delay:40ms; }
        .cp-search-item:nth-child(3){ animation-delay:80ms; }
        .cp-search-item:nth-child(4){ animation-delay:120ms; }
        .cp-search-item:nth-child(5){ animation-delay:160ms; }
        .cp-search-item:nth-child(6){ animation-delay:200ms; }
        .cp-search-item:nth-child(7){ animation-delay:240ms; }
        .cp-search-item:nth-child(8){ animation-delay:280ms; }
        .cp-search-item:hover{ background:#fafafa; }
        .cp-search-item .thumb{
          width:42px; height:32px; object-fit:cover;
          border-radius:6px; border:1px solid #eee; background:#f6f6f6;
        }
        .cp-search-item .b{ font-weight:700; }
        .cp-search-item .i{ font-style:italic; }

        @keyframes cpSearchReveal{
          from{ opacity:0; transform:translateY(-6px); }
          to{ opacity:1; transform:translateY(0); }
        }

        @keyframes cpSearchItem{
          from{ opacity:0; transform:translateY(-6px); }
          to{ opacity:1; transform:translateY(0); }
        }
      `}</style>
    </form>
  );
}
