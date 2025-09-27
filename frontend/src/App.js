import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import SellerPage from './pages/SellerPage';
import AudienceGate from './pages/AudienceGate';
import { getAudience } from './utils/audience';

function RequireAudience({ children }) {
  const location = useLocation();
  const aud = getAudience(); // 'RESIDENT' | 'TOURIST' | null
  if (!aud) {
    return <Navigate to="/audiencia" state={{ from: location }} replace />;
  }
  return children;
}

export default function App(){
  return (
    <Routes>
      {/* selector full-screen */}
      <Route path="/audiencia" element={<AudienceGate />} />
      <Route path="/audience"  element={<AudienceGate />} /> {/* alias en inglés */}


      {/* rutas protegidas */}
      <Route
        path="/"
        element={
          <RequireAudience>
            <HomePage />
          </RequireAudience>
        }
      />
      <Route
        path="/producto/:id"
        element={
          <RequireAudience>
            <ProductPage />
          </RequireAudience>
        }
      />
      <Route
        path="/categoria/:id"
        element={
          <RequireAudience>
            <CategoryPage />
          </RequireAudience>
        }
      />
      <Route
        path="/negocio/:id"
        element={
          <RequireAudience>
            <SellerPage />
          </RequireAudience>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
