import React, { useEffect, useRef } from 'react';

/**
 * Soporta dos modos:
 *  - MODO GRUPOS (preferido):  <ProductSlider groups={[{id, products:[{id,imageUrl},...]}, ...]} />
 *  - MODO LEGADO (imagenes):   <ProductSlider images={[{id,imageUrl}, ...]} />
 *
 * Navega SIEMPRE por "slide", donde un slide = 1 agrupación.
 * Dentro de cada agrupación, cada producto es una imagen clickeable a /producto/:id
 */
export default function ProductSlider({ id, groups = [], images = [] }) {
  const trackRef = useRef(null);
  const rootRef  = useRef(null);

  // Drag / swipe
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const pt = (e) => (e.touches ? e.touches[0].pageX : e.pageX);
    const down = (e) => { isDown = true; startX = pt(e) - el.offsetLeft; scrollLeft = el.scrollLeft; };
    const move = (e) => { if (!isDown) return; e.preventDefault(); const x = pt(e) - el.offsetLeft; el.scrollLeft = scrollLeft - (x - startX); };
    const up = () => (isDown = false);

    el.addEventListener('mousedown', down);
    el.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move,  { passive: false });
    window.addEventListener('touchend', up);

    return () => {
      el.removeEventListener('mousedown', down);
      el.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, []);

  // Calcula el ancho exacto de una "página" (1 slide = 1 agrupación)
  const pageDeltaPx = () => {
    const track = trackRef.current;
    if (!track) return 0;
    const current = track.querySelector('.ps-card'); // cualquier slide
    if (!current) return 0;
    const rect = current.getBoundingClientRect();
    // sumamos gap del track (si existe)
    const stylesTrack = getComputedStyle(track);
    const gap = parseFloat(stylesTrack.gap || stylesTrack.columnGap || 0);
    return rect.width + gap;
  };

  const go = (dir) => {
    const delta = pageDeltaPx();
    if (!delta) return;
    trackRef.current?.scrollBy({ left: dir * delta, behavior: 'smooth' });
  };

  // Fallback "modo legacy": si no hay groups, armamos grupos de 1 imagen
  const slides = groups && groups.length
    ? groups
    : images.map(img => ({ id: img.id, products: [img] }));

  return (
    <div className="ps-root" id={id} ref={rootRef}>
      <button className="ps-nav prev" onClick={() => go(-1)} aria-label="Anterior">‹</button>

      <div className="ps-track" ref={trackRef}>
        {slides.map((g, idx) => {
          const n = (g.products?.length || 0);
          // classes por cantidad (auto layout si >4)
          const clsCount = n >= 1 && n <= 4 ? `pg-n-${n}` : 'pg-n-auto';
          const clsVar   = g.variant ? `pg-${g.variant}` : '';
          return (
            <div className={`ps-card pg-card ${clsCount} ${clsVar}`} key={g.id ?? idx}>
              <div className="pg-grid">
                {(g.products || []).map((p, i) => (
                  <a key={p.id ?? i} className="pg-item" href={`/producto/${p.id}`}>
                    <img src={p.imageUrl || p.image || '/placeholder.png'} alt="" />
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button className="ps-nav next" onClick={() => go(1)} aria-label="Siguiente">›</button>
    </div>
  );
}
