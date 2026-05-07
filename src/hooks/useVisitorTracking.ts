import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisitorTracking() {
  useEffect(() => {
    async function log() {
      // ipify gives us the visitor's public IP
      let ip: string | null = null;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip ?? null;
      } catch {
        // silently fail — don't block the page
      }

      await supabase.from('visitor_logs').insert({
        ip,
        user_agent: navigator.userAgent,
        page: window.location.pathname,
      });
    }

    log();
  }, []);
}
