import React from 'react';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useControls } from 'leva';

function Plane() {
  return <CuboidCollider args={[50, 0.5, 50]} position={[0, -1, 0]} type="fixed" />;
}

function Particle({ velocity }) {
  const x = (Math.random() - 0.5) * 10;
  const y = Math.random() * 5 + 2;
  const z = (Math.random() - 0.5) * 10;
  const vx = (Math.random() - 0.5) * velocity;
  const vy = Math.random() * velocity;
  const vz = (Math.random() - 0.5) * velocity;

  return (
    <RigidBody
      colliders="ball"
      mass={1}
      position={[x, y, z]}
      velocity={[vx, vy, vz]}
      restitution={0.5}
    >
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </RigidBody>
  );
}

export default function ParticleSystem() {
  const { count, velocity, gravity } = useControls('Particles', {
    count: { value: 100, min: 0, max: 500, step: 10 },
    velocity: { value: 2, min: 0, max: 10, step: 0.1 },
    gravity: { value: -9.81, min: -20, max: 0, step: 0.1 },
  });

  return (
    <Physics gravity={[0, gravity, 0]}>
      <Plane />
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i} velocity={velocity} />
      ))}
    </Physics>
  );
} 