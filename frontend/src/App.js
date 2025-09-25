import React, { useEffect, useState } from 'react';
import SearchBarUnified from './components/SearchBarUnified';
import ProductSlider from './components/ProductSlider';
import CategorySlider from './components/CategorySlider';
import { getCategories, getSections, getSectionGroups } from './services/api';
import './styles.css';

const ORDER = ['Gastronomía','Indumentaria','Hogar','Tecnología','Deportes','Belleza'];

export default function App(){
  const [categorias, setCategorias] = useState([]);
  const [sectionsWithGroups, setSectionsWithGroups] = useState([]); // [{ section, groups }]

  useEffect(() => {
    (async () => {
      // 1) Categorías
      const catsRaw = await getCategories();
      const catsOrdered = [...catsRaw].sort((a,b)=>{
        const ai = ORDER.indexOf(a.name), bi = ORDER.indexOf(b.name);
        return (ai===-1?999:ai) - (bi===-1?999:bi);
      });
      setCategorias(catsOrdered);

      // 2) Secciones habilitadas desde BD
      const secs = await getSections(); // [{id,name,slug,...}], ya en orden si el repo lo devuelve ordenado
      // 3) Traer grupos para cada sección en paralelo
        const pairs = await Promise.all(secs.map(async (s) => {
          const groups = await getSectionGroups(s.id);   // <-- antes pasabas s.slug
          return { section: s, groups: groups || [] };
        }));
      // 4) Opcional: ocultar secciones sin grupos
      setSectionsWithGroups(pairs.filter(p => (p.groups?.length || 0) > 0));
    })().catch(e => console.error(e));
  }, []);

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          <a href="/"><img src="/logo.png" alt="Conecta Pinamar" /></a>
        </div>
        <SearchBarUnified />
      </header>

      {/* Categorías */}
      <section>
        <h2 className="title">CATEGORÍAS</h2>
        <CategorySlider categories={categorias} />
      </section>

      {/* Una sección de slider por cada sección guardada en la BD */}
      {sectionsWithGroups.map(({ section, groups }) => (
        <section key={section.id}>
          <h2 className="title">{section.name}</h2>
          {/* ProductSlider en modo GRUPOS */}
          <ProductSlider id={section.slug} groups={groups} />
        </section>
      ))}
    </div>
  );
}
