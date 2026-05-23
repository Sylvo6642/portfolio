import { useEffect, useState } from 'react';

export function useScrollSpy(ids: string[], offset = 120) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');

  // On mount, scroll to the section matching the current hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ids.includes(hash)) {
      const el = document.getElementById(hash);
      if (el) {
        // Small delay to let the page finish rendering
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + offset;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= y) current = id;
      }
      setActiveId(current);

      // Update URL hash without adding to history
      const newHash = window.scrollY < 50 ? '' : `#${current}`;
      const currentHash = window.location.hash;
      if (newHash !== currentHash) {
        history.replaceState(null, '', newHash || window.location.pathname);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offset]);

  return activeId;
}
