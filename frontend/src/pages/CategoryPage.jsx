import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryProducts } from '../services/api';

export default function CategoryPage(){
  const { id } = useParams();
  const [items, setItems] = useState([]);
  useEffect(()=>{ (async()=> setItems(await getCategoryProducts(id)))(); }, [id]);
  return (
    <div className="cp-category-page">
      <h1>Categoría #{id}</h1>
      <div className="grid">
        {items.map(p => (
          <a key={p.id} className="card" href={`/producto/${p.id}`}>
            <img src={p.imageUrl} alt="" />
          </a>
        ))}
      </div>
    </div>
  );
}
