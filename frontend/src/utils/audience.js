// src/utils/audience.js
const COOKIE_NAME = 'audience';
const MAX_DAYS = 365;

export function getAudience(){
  const m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME.replace(/([.$?*|{}()\[\]\\/+^])/g,'\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function setAudience(value){
  const expires = new Date(Date.now() + MAX_DAYS*24*60*60*1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;

  // 🔧 NUEVO: actualizar Axios inmediatamente para las próximas llamadas
  try {
    const axios = require('axios').default;
    axios.defaults.headers.common['X-Audience'] = value;
  } catch (_) { /* noop en build */ }
}

export function clearAudience(){
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  try {
    const axios = require('axios').default;
    delete axios.defaults.headers.common['X-Audience'];
  } catch (_) { /* noop */ }
}
