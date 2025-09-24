import axios from 'axios';
export async function searchAll(q, signal) {
  if (!q?.trim()) return { products: [], categories: [], sellers: [] };
  const { data } = await axios.get('/api/search', { params: { q }, signal });
  return data;
}

export async function getCategories() {
  const { data } = await axios.get('/api/categories');
  return data; // [{ id, name, description }]
}

export async function getHomeProducts(limit = 12) {
  const { data } = await axios.get('/api/products/home', { params: { limit } });
  return data; // [{ id, name, description, imageUrl, price, seller, categories }]
}
// 🔥 NUEVO: secciones públicas habilitadas
export async function getSections(){
  const { data } = await axios.get('/api/sections');
  return data; // [{ id, name, slug, orderIndex, enabled }]
}

// 🔥 NUEVO: grupos (agrupaciones) por slug de sección
export async function getSectionGroups(slug){
  const { data } = await axios.get(`/api/sections/${encodeURIComponent(slug)}/groups`);
  return data; // [{ id, variant?, products:[{id,imageUrl}, ...] }]
}
// (ya lo tenías, pero lo dejo por si faltaba)
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