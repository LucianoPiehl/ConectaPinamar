import React from 'react';

/**
 * categories: [{ id, name, imageUrl }]
 * - Clic en el círculo o la imagen → /categoria/:id
 * - La imagen queda centrada dentro del círculo amarillo
 */
export default function CategorySlider({ categories = [] }) {
  return (
    <div className="cats" role="list">
      {categories.map(c => (
        <a
          key={c.id}
          className="cat-chip"
          href={`/categoria/${c.id}`}
          title={c.name}
          role="listitem"
          aria-label={`Ver ${c.name}`}
        >
          <img src={c.imageUrl || '/placeholder-cat.png'} alt="" />
        </a>
      ))}
    </div>
  );
}
