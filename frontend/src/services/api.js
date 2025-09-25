import axios from 'axios';

export async function searchAll(q, signal) {
  if (!q?.trim()) return { products: [], categories: [], sellers: [] };
  const { data } = await axios.get('/api/search', { params: { q }, signal });
  return data;
}

export async function getCategories() {
  const { data } = await axios.get('/api/categories');
  return data;
}

export async function getHomeProducts(limit = 12) {
  const { data } = await axios.get('/api/products/home', { params: { limit } });
  return data;
}

export async function getSections() {
  try {
    const { data } = await axios.get('/api/sections');
    return data; // [{ id, name, slug, orderIndex, enabled }]
  } catch (err) {
    console.error('[getSections] ERROR:', err?.response?.status, err?.response?.data || err?.message);
    return [];
  }
}

/**
 * Obtiene grupos de una sección.
 * - Si pasás un número (o un objeto con .id), consulta por ID: /api/sections/:id/groups
 * - Si pasás un string (slug), intenta query ?slug=... y luego fallback por path /:slug/groups
 */
export async function getSectionGroups(sectionRef) {
  // normalizo refs
  const id   = typeof sectionRef === 'object' && sectionRef?.id != null
    ? sectionRef.id
    : (typeof sectionRef === 'number' ? sectionRef : null);

  const slug = typeof sectionRef === 'object' && sectionRef?.slug
    ? sectionRef.slug
    : (typeof sectionRef === 'string' ? sectionRef : null);

  // 1) Preferir SIEMPRE por ID (evita problemas con % y demás)
  if (id != null) {
    try {
      const { data } = await axios.get(`/api/sections/${id}/groups`);
      return data;
    } catch (err) {
      console.error('[getSectionGroups:id] ERROR:', id, err?.response?.status, err?.response?.data || err?.message);
    }
  }

  // 2) Si no hubo ID (o falló), intento por query param (si el backend lo tiene)
  if (slug != null) {
    try {
      const { data } = await axios.get('/api/sections/groups', { params: { slug } });
      return data;
    } catch {
      // 3) Fallback final al path con encodeURIComponent
      try {
        const { data } = await axios.get(`/api/sections/${encodeURIComponent(slug)}/groups`);
        return data;
      } catch (e2) {
        console.error('[getSectionGroups:slug] ERROR:', slug, e2?.response?.status, e2?.response?.data || e2?.message);
      }
    }
  }

  return [];
}

export const getCategoryProducts = async (id) =>
  (await axios.get(`/api/categories/${id}/products`)).data;

export const getProduct = async (id) =>
  (await axios.get(`/api/products/${id}`)).data;

export const getSeller = async (id) =>
  (await axios.get(`/api/sellers/${id}`)).data;

export const getSellerProducts = async (id) =>
  (await axios.get(`/api/sellers/${id}/products`)).data;

export const postSellerVisit = async (id) =>
  axios.post(`/api/sellers/${id}/visit`);
