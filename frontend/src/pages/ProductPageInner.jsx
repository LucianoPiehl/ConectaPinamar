import React, { useEffect, useState } from 'react';
import { getProduct, getSeller, postSellerVisit } from '../services/api';

export default function ProductPageInner({ id }){
  const [p, setP] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(()=>{
    (async()=>{
      const prod = await getProduct(id);
      setP(prod);
      if (prod?.seller?.id) setSeller(await getSeller(prod.seller.id));
    })();
  }, [id]);

  if(!p) return <div className="loading">Cargando…</div>;

  const goSeller = async () => {
    if (p?.seller?.id) {
      await postSellerVisit(p.seller.id);
      window.location.href = `/negocio/${p.seller.id}`;
    }
  };

  return (
    <div className="cp-product-page">
      <h1>{p.name}</h1>
      <img className="hero" src={p.imageUrl} alt={p.name} />
      <p className="desc">{p.description}</p>
      {typeof p.price !== 'undefined' && <div className="price">${p.price?.toLocaleString('es-AR')}</div>}
      <button className="btn" onClick={goSeller}>Ir al sitio del vendedor</button>
    </div>
  );
}
