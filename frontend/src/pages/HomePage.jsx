import React, { useEffect, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import ProductSlider from '../components/ProductSlider';
import CategorySlider from '../components/CategorySlider';
import { getCategories, getSections, getSectionGroups } from '../services/api';
import '../styles.css';

const ORDER = ['Gastronomía','Indumentaria','Hogar','Tecnología','Deportes','Belleza'];

export default function HomePage(){
  const [categorias, setCategorias] = useState([]);
  const [sectionsWithGroups, setSectionsWithGroups] = useState([]); // [{ section, groups }]

  useEffect(() => {
    (async () => {
      const catsRaw = await getCategories();
      const catsOrdered = [...catsRaw].sort((a,b)=>{
        const ai = ORDER.indexOf(a.name), bi = ORDER.indexOf(b.name);
        return (ai===-1?999:ai) - (bi===-1?999:bi);
      });
      setCategorias(catsOrdered);

      const secs = await getSections();
      const pairs = await Promise.all(secs.map(async (s) => {
        const groups = await getSectionGroups(s.slug);
        return { section: s, groups: groups || [] };
      }));
      setSectionsWithGroups(pairs.filter(p => (p.groups?.length || 0) > 0));
    })().catch(e => console.error(e));
  }, []);

  return (
    <div className="page">
      <SiteHeader />

      {/* Categorías */}
      <section>
        <h2 className="title">CATEGORÍAS</h2>
        <CategorySlider categories={categorias} />
      </section>

      {/* Secciones dinámicas */}
      {sectionsWithGroups.map(({ section, groups }) => (
        <section key={section.id}>
          <h2 className="title">{section.name}</h2>
          <ProductSlider id={section.slug} groups={groups} />
        </section>
      ))}
    </div>
  );
}
