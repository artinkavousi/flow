import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import MetaballScene from './MetaballScene';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Dashboard>
        <MetaballScene />
      </Dashboard>
    </div>
  );
} 