import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSeller } from '../services/api';
import ProductSlider from '../components/ProductSlider';

export default function SellerPage(){
  const { id } = useParams();
  const [s, setS] = useState(null);
  useEffect(()=>{ (async()=> setS(await getSeller(id)))(); }, [id]);

  if(!s) return <div className="loading">Cargando…</div>;

  const imgs = (s.products || []).map(p => ({ id: p.id, imageUrl: p.imageUrl }));

  return (
    <div className="cp-seller-page">
      <div className="header">
        <img className="avatar" src={s.imageUrl || '/placeholder.png'} alt="" />
        <div>
          <h1>{s.name}</h1>
          <p className="muted">{s.location}</p>
          <p>{s.description}</p>
          <div className="contact">
            {s.contactPhone && <div>Tel: {s.contactPhone}</div>}
            {s.contactEmail && <div>Email: {s.contactEmail}</div>}
          </div>
        </div>
      </div>

      <h2>Productos del vendedor</h2>
      <ProductSlider id="seller-products" images={imgs} />
    </div>
  );
}
