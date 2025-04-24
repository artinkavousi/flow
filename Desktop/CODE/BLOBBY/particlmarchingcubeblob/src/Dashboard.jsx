import React from 'react';
import { Leva } from 'leva';

// Custom glassmorphism theme for Leva panel
const glassTheme = {
  colors: {
    rootText: '#000000', // ensure main text is black
    elevation1: 'rgba(255, 255, 255, 0.15)',
    elevation2: 'rgba(255, 255, 255, 0.10)',
    elevation3: 'rgba(0, 0, 0, 0.2)',   // darker inputs background
    accent1: '#000000',   // darkest accent for visibility
    accent2: '#000000',
    accent3: '#000000',
    highlight1: '#000000', // darkest label text
    highlight2: '#000000',
    highlight3: '#000000',  // main text
    vivid1: '#ffcc00',
  },
  radii: {
    xs: '8px',
    sm: '10px',
    lg: '16px',
  },
  shadows: {
    level1: '0 4px 30px rgba(0, 0, 0, 0.1)',
    level2: '0 6px 40px rgba(0, 0, 0, 0.2)',
  },
};

export default function Dashboard({ children }) {
  return (
    <>
      <div className="leva-glass-wrapper">
        <Leva collapsed theme={glassTheme} hideCopyButton />
      </div>
      {children}
    </>
  );
}
