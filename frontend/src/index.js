import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import SellerPage from './pages/SellerPage';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/producto/:id" element={<ProductPage />} />
      <Route path="/categoria/:id" element={<CategoryPage />} />
      <Route path="/negocio/:id" element={<SellerPage />} />
    </Routes>
  </BrowserRouter>
);
