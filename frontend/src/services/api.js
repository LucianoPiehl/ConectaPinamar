import axios from 'axios';
import { getAudience } from '../utils/audience';

// 1) Set inicial (por si ya existe cookie al cargar)
const audInitial = typeof window !== 'undefined' ? getAudience() : null;
if (audInitial) {
  axios.defaults.headers.common['X-Audience'] = audInitial;
}

// 2) Interceptor: asegura que cada request lleve la audiencia actual
axios.interceptors.request.use((config) => {
  try {
    const aud = getAudience();
    if (aud) {
      config.headers = config.headers || {};
      config.headers['X-Audience'] = aud;
    } else {
      if (config.headers && 'X-Audience' in config.headers) {
        delete config.headers['X-Audience'];
      }
    }
  } catch (_) { /* noop */ }
  return config;
});

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

export async function getSections(){
  const { data } = await axios.get('/api/sections');
  return data;
}

// Robust endpoint for groups (works with special chars in slug)
export async function getSectionGroups(slug){
  try {
    const { data } = await axios.get('/api/sections/groups', { params: { slug } });
    return data;
  } catch (e) {
    const { data } = await axios.get(`/api/sections/${encodeURIComponent(slug)}/groups`);
    return data;
  }
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
