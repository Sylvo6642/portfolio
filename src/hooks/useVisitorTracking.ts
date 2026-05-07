import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisitorTracking() {
  useEffect(() => {
    async function log() {
      let ip: string | null = null;
      let country: string | null = null;
      let city: string | null = null;

      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        ip = data.ip ?? null;
        country = data.country_name ?? null;
        city = data.city ?? null;
      } catch {
        // silently fail
      }

      await supabase.from('visitor_logs').insert({
        ip,
        country,
        city,
        user_agent: navigator.userAgent,
        page: window.location.pathname,
      });
    }

    log();
  }, []);
}
