import React, { useEffect, useState } from 'react';
import SearchBarUnified from './SearchBarUnified';
import { AUDIENCES, getAudience, setAudience } from '../utils/audience';
import axios from 'axios';

export default function HeaderNew({ onChangeAudience }){
  const [aud, setAud] = useState(getAudience() || AUDIENCES.RESIDENT);
  const [open, setOpen] = useState(false);
  useEffect(()=>{
    setAudience(aud);
    axios.defaults.headers.common['X-Audience'] = aud;
    onChangeAudience && onChangeAudience(aud);
  }, [aud, onChangeAudience]);

  return (
    <header className="cp-header header-new">
      <div className="cp-header-inner">
        <a href="/" className="cp-brand">
          <img src="/logo.png" alt="Conecta Pinamar" />
        </a>

        <div className="cp-search-outer">
          <SearchBarUnified />
        </div>

        <div className="cp-right">
          <a className="cp-btn" href="/cupones">MIS CUPONES</a>

          <div className="cp-aud">
            <button className="cp-aud-pill" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
              {aud === AUDIENCES.RESIDENT ? 'Residente' : 'Turista'}
            </button>
            {open && (
              <div className="cp-aud-menu" onMouseLeave={()=>setOpen(false)}>
                <button onClick={()=>{setAud(AUDIENCES.RESIDENT); setOpen(false);}}>Residente</button>
                <button onClick={()=>{setAud(AUDIENCES.TOURIST); setOpen(false);}}>Turista</button>
              </div>
            )}
          </div>

          <button className="cp-burger" aria-label="Abrir menú">
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </header>
  );
}
