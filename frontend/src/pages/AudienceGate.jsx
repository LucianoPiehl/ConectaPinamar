import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAudience } from '../utils/audience';
import '../styles.css';

/**
 * Selector a pantalla completa (sin animaciones)
 * - Fondo amarillo sólido que tapa la UI detrás.
 * - Hover marca TODO el cuadrante.
 * - Al elegir, persiste audiencia y navega.
 * - Mientras el gate está visible, el <body> tiene la clase `ag-open`
 *   (fondo/control de scroll).
 */
export default function AudienceGate() {
  const nav = useNavigate();
  const loc = useLocation();

  // Colocar/quitar clase en <body> mientras el gate esté montado
  useEffect(() => {
    document.body.classList.add('ag-open');
    return () => document.body.classList.remove('ag-open');
  }, []);

  const choose = (audValue) => {
    setAudience(audValue);
    axios.defaults.headers.common['X-Audience'] = audValue;

    const to = (loc.state && loc.state.from)
      ? loc.state.from.pathname + (loc.state.from.search || '')
      : '/';

    // limpiar estado y navegar
    document.body.classList.remove('ag-open');
    nav(to, { replace: true });
  };

  return (
    <div className="ag-root">
      {/* BACKDROP sólido */}
      <div className="ag-backdrop" aria-hidden />

      {/* Contenido del gate */}
      <div className="ag-content">
        {/* Logo grande + subrayado */}
        <div className="ag-logo-wrap">
          <img src="/logo.png" alt="Conecta Pinamar" className="ag-logo" />
          <div className="ag-underline" />
        </div>

        {/* Dos cuadrantes con hover de bloque completo */}
        <div className="ag-split">
          <button className="ag-side ag-left" onClick={() => choose('TOURIST')}>
            <span className="ag-label">Soy Turista</span>
          </button>
          <button className="ag-side ag-right" onClick={() => choose('RESIDENT')}>
            <span className="ag-label">Soy Residente</span>
          </button>
        </div>
      </div>
    </div>
  );
}
