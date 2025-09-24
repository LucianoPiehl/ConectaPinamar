import { useEffect, useRef } from 'react';
export function useCancelable(){
  const ref = useRef(null);
  const cancel = ()=>{ if(ref.current) ref.current.abort(); ref.current=null; };
  const controller = ()=>{ cancel(); ref.current = new AbortController(); return ref.current.signal; };
  useEffect(()=>cancel, []);
  return { controller, cancel };
}
