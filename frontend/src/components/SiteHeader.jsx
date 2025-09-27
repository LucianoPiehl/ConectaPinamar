// components/SiteHeader.jsx
import React, { useEffect, useRef, useState } from 'react';
import SearchBarUnified from './SearchBarUnified';
import { getAudience, setAudience } from '../utils/audience';

export default function SiteHeader(){
  const [scrolled, setScrolled] = useState(false);
  const [aud, setAud] = useState(getAudience() || 'RESIDENT');
  const [menuOpen, setMenuOpen] = useState(false);
  const [audOpen, setAudOpen] = useState(false);

  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;

    const updateScrollState = () => {
      const rect = el.getBoundingClientRect();
      const headerHeight = 72; // altura aprox. del header compacto
      setScrolled(rect.bottom <= headerHeight);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const switchAud = (v) => {
    setAudience(v);
    setAud(v);
    setAudOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      {/* HERO grande */}
      <div ref={heroRef} className={`cp-hero ${scrolled ? 'is-hidden' : ''}`}>
        <div className="cp-hero-inner">
          <a className="cp-brand-big" href="/" aria-label="Conecta Pinamar">
            <img src="/logo.png" alt="" />
          </a>
          <div className="ContHead">
            <div className="cp-hero-search">
              <SearchBarUnified />
            </div>
            <div className="cp-aud cp-aud-hero">
              <button
                className="cp-aud-pill"
                aria-haspopup="menu"
                aria-expanded={audOpen}
                onClick={() => setAudOpen(v => !v)}
              >
                {aud === 'TOURIST' ? 'Turista' : 'Residente'}
              </button>
              {audOpen && (
                <div className="cp-aud-menu" role="menu">
                  <button onClick={() => switchAud('RESIDENT')}>Residente</button>
                  <button onClick={() => switchAud('TOURIST')}>Turista</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header chico (aparece sólo al scrollear) */}
      <header className={`cp-header ${scrolled ? 'show' : ''}`}>
        <div className="cp-header-inner">
          <a className="cp-brand" href="/" aria-label="Conecta Pinamar">
            <img src="/logo.png" alt="" />
          </a>

          <div className="cp-search-outer">
            <SearchBarUnified />
          </div>

          <div className="cp-right">
            <div className="cp-aud">
              <button
                className="cp-aud-pill"
                aria-haspopup="menu"
                aria-expanded={audOpen}
                onClick={() => setAudOpen(v => !v)}
              >
                {aud === 'TOURIST' ? 'Turista' : 'Residente'}
              </button>
              {audOpen && (
                <div className="cp-aud-menu" role="menu">
                  <button onClick={() => switchAud('RESIDENT')}>Residente</button>
                  <button onClick={() => switchAud('TOURIST')}>Turista</button>
                </div>
              )}
            </div>

            <button className="cp-burger" aria-label="Menú" onClick={() => setMenuOpen(true)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile opcional */}
      <div className={`cp-drawer ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className="panel" onClick={(e)=>e.stopPropagation()}>
          <h4>Audiencia</h4>
          <div className="aud-switch">
            <button className={aud==='RESIDENT'?'active':''} onClick={()=>switchAud('RESIDENT')}>Residente</button>
            <button className={aud==='TOURIST'?'active':''} onClick={()=>switchAud('TOURIST')}>Turista</button>
          </div>
        </div>
      </div>
    </>
  );
}
