import React, { useEffect, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useCancelable } from '../hooks/useCancelable';
import { searchAll } from '../services/api';

export default function SearchBarUnified(){
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q, 250);
  const { controller } = useCancelable();
  const [combined, setCombined] = useState([]);

  useEffect(()=>{
    if(!debounced.trim()){ setCombined([]); return; }
    (async()=>{
      try{
        const data = await searchAll(debounced, controller());
        const cap = 8;
        const p = data.products || [];
        const c = data.categories || [];
        const s = data.sellers || [];
        const arr = [];
        for(const it of p){ if(arr.length<cap) arr.push({type:'product', ...it}); }
        for(const it of c){ if(arr.length<cap) arr.push({type:'category', ...it}); }
        for(const it of s){ if(arr.length<cap) arr.push({type:'seller', ...it}); }
        setCombined(arr);
      }catch(e){/* ignore cancels */}
    })();
  }, [debounced]);

  return (
    <div className="cp-search-wrap">
      <input
        className="cp-search-input"
        placeholder="Buscar productos, categorías y negocios"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />
      {!!combined.length && (
        <div className="cp-search-panel">
          {combined.map(item => (
            <a
              key={`${item.type}-${item.id}`}
              href={item.type==='product' ? `/producto/${item.id}` : item.type==='category' ? `/categoria/${item.id}` : `/negocio/${item.id}`}
              className="cp-search-item"
            >
              <img className="thumb" src={item.imageUrl || item.image || '/placeholder.png'} alt="" />
              <span className={item.type==='category' ? 'b' : item.type==='seller' ? 'i' : ''}>
                {item.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
