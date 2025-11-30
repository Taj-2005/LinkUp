'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const progress = Math.min(100, Math.max(0, (scrollTop / (documentHeight - windowHeight)) * 100));
      
      setScrollProgress(progress);
    };

    const handleScroll = () => {
      updateScrollProgress();
    };

    // Initial calculation
    updateScrollProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 z-[100] origin-left"
      style={{ 
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: 'left',
      }}
    />
  );
}
