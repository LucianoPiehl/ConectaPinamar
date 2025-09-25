import React, { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useCancelable } from '../hooks/useCancelable';
import { searchAll } from '../services/api';

/**
 * SearchBarUnified
 *
 * Dos modos de uso:
 * - GLOBAL (por defecto): busca en el backend con searchAll() y muestra dropdown de resultados.
 * - LOCAL/SCOPED: si pasás `scopeItems` (array), NO consulta a la API. Filtra localmente y
 *   devuelve el resultado por `onScopedChange(filtered, term)`. El panel se puede ocultar con showPanel={false}.
 *
 * Props:
 * - placeholder?: string
 * - scopeItems?: any[]                 // activa modo local si existe
 * - onScopedChange?: (items, term) => void
 * - showPanel?: boolean                // default true (para modo global). En local suele ir false.
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
  const { controller } = useCancelable();
  const [combined, setCombined] = useState([]);

  // --- Normalizador para filtro local
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

  const filterLocal = useMemo(() => {
    if (!Array.isArray(scopeItems)) return () => [];
    return (term) => {
      const t = norm(term).trim();
      if (!t) return scopeItems;
      return scopeItems.filter((p) => {
        const name = norm(p.name);
        const desc = norm(p.description);
        const seller = norm(p.seller?.name);
        return name.includes(t) || desc.includes(t) || seller.includes(t);
      });
    };
  }, [scopeItems]);

  // --- Lógica: global vs local
  useEffect(() => {
    // MODO LOCAL
    if (Array.isArray(scopeItems)) {
      const filtered = filterLocal(debounced);
      if (typeof onScopedChange === 'function') onScopedChange(filtered, debounced);
      // en modo local no usamos "combined" (dropdown global), lo limpiamos
      setCombined([]);
      return;
    }

    // MODO GLOBAL (igual a tu implementación original)
    if (!debounced.trim()) {
      setCombined([]);
      return;
    }
    (async () => {
      try {
        const data = await searchAll(debounced, controller());
        const cap = 8;
        const p = data.products || [];
        const c = data.categories || [];
        const s = data.sellers || [];
        const arr = [];
        for (const it of p) { if (arr.length < cap) arr.push({ type: 'product', ...it }); }
        for (const it of c) { if (arr.length < cap) arr.push({ type: 'category', ...it }); }
        for (const it of s) { if (arr.length < cap) arr.push({ type: 'seller', ...it }); }
        setCombined(arr);
      } catch (e) {
        // ignore cancels
      }
    })();
  }, [debounced, scopeItems, filterLocal, onScopedChange, controller]);

  const onSubmit = (e) => {
    e.preventDefault(); // en local ya filtramos con debounce; en global el submit no es necesario
  };

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
      {/* Botón lupa sólo visual (para calzar con el mock) */}
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

      {/* Panel de resultados sólo en modo GLOBAL (o si showPanel === true) */}
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

      {/* estilos mínimos del control (el “skin” final puede venir de la página) */}
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
        }
        .cp-search-item{
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; text-decoration:none; color:#111;
        }
        .cp-search-item:hover{ background:#fafafa; }
        .cp-search-item .thumb{
          width:42px; height:32px; object-fit:cover;
          border-radius:6px; border:1px solid #eee; background:#f6f6f6;
        }
        .cp-search-item .b{ font-weight:700; }
        .cp-search-item .i{ font-style:italic; }
      `}</style>
    </form>
  );
}
