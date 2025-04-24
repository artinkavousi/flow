import * as THREE from 'three'
import React, { useRef, useMemo, useEffect, memo } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { MarchingCubes, MarchingCube, Bounds, OrbitControls, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Physics, RigidBody, BallCollider } from '@react-three/rapier'
import { LayerMaterial as VanillaLayerMaterial, Depth, Fresnel, Noise, Abstract } from 'lamina/vanilla'
import { useControls, folder } from 'leva'
import Effects from './Effects'
import { Perf } from 'r3f-perf'
import { Vector3 } from 'three'

// Custom Layer to read Vertex Colors
class VertexColorLayer extends Abstract {
  // Define the attribute we expect from the geometry
  static attributes = {
    color: 'vec3',
  }

  // Define varyings for GLSL
  static varyings = {
    vColor: 'vec3',
  }

  static vertexShader = `
    // Declare the attribute we are reading
    attribute vec3 color;
    // Declare the varying to output
    varying vec3 v_vColor;

    void main() {
      // Assign the input attribute 'color' to the output varying 'v_vColor'
      v_vColor = color;
      // Lamina layers need to return the final position
      return position;
    }
  `

  static fragmentShader = `
    // Read the varying passed from the vertex shader
    varying vec3 v_vColor;

    vec4 main() {
      // Use the varying for the final color
      return vec4(v_vColor, 1.0);
    }
  `

  constructor(props) {
    super(VertexColorLayer, {
      name: 'VertexColorLayer',
      ...props,
    })
  }
}

// reuse one vector instance to avoid allocations
const tempVec = new Vector3()

const MetaBall = memo(function MetaBall({ color, strength = 0.35, subtract = 6, colliderRadius = 0.1, ...props }) {
  const api = useRef()
  useFrame((state, delta) => {
    if (!api.current) return
    delta = Math.min(delta, 0.1)
    tempVec.copy(api.current.translation()).normalize().multiplyScalar(delta * -0.05)
    api.current.applyImpulse(tempVec)
  })
  return (
    <RigidBody ref={api} colliders={false} linearDamping={4} angularDamping={0.95} {...props}>
      <MarchingCube strength={strength} subtract={subtract} color={color} />
      <BallCollider args={[colliderRadius]} type="dynamic" />
    </RigidBody>
  )
})

const Pointer = memo(function Pointer({ strength = 0.5, subtract = 10, colliderRadius = 0.1 }) {
  const ref = useRef()
  useFrame(({ pointer, viewport }) => {
    if (!ref.current) return
    const { width, height } = viewport.getCurrentViewport()
    tempVec.set(pointer.x * (width / 2), pointer.y * (height / 2), 0)
    ref.current.setNextKinematicTranslation(tempVec)
  })
  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>
      <MarchingCube strength={strength} subtract={subtract} color="orange" />
      <BallCollider args={[colliderRadius]} type="dynamic" />
    </RigidBody>
  )
})

// Re-introduce CameraController to apply Leva FOV updates
function CameraController({ fov }) { // Removed cameraZ prop for now
  const { camera } = useThree();

  useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [fov, camera]); // Dependency on fov and camera

  return null;
}

// Suppress Rapier deprecated initialization warning
const _warn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('using deprecated parameters for the initialization function; pass a single object instead')) {
    return;
  }
  _warn(...args);
};

export default function MetaballScene() {
  // Restore full Leva Controls - add directionalLightIntensity
  const { resolution, gravity, roughness, thickness, ior, depthColorA, depthColorB, depthAlpha, noiseAlpha, noiseScale, fresnelAlpha, fresnelIntensity, fresnelPower,
          fov, ambientLightIntensity, directionalLightIntensity,
          metaballStrength, metaballSubtract, pointerStrength, pointerSubtract, metaballColliderRadius, pointerColliderRadius, boundsScale } = useControls({
    store: 'Metaballs',
    resolution: { value: 80, min: 10, max: 200, step: 10, label: 'Resolution' },
    gravity: { value: 2, min: -10, max: 10, step: 0.1, label: 'Gravity Y' },
    camera: folder({ fov: { value: 25, min: 10, max: 120, step: 1, label: 'Field of View' } }),
    lighting: folder({ ambientLightIntensity: { value: 1, min: 0, max: 5, step: 0.1, label: 'Ambient Intensity' }, directionalLightIntensity: { value: 1.5, min: 0, max: 10, step: 0.1, label: 'Directional Intensity' } }),
    material: folder({ roughness: { value: 0.2, min: 0, max: 1, step: 0.01 }, thickness: { value: 2, min: 0, max: 5, step: 0.1 }, ior: { value: 2, min: 1, max: 2.33, step: 0.01 } }),
    layers: folder({ depthColorA: { value: '#f0f0f0', label: 'Depth Color A' }, depthColorB: { value: '#00bfff', label: 'Depth Color B' }, depthAlpha: { value: 0.2, min: 0, max: 1, step: 0.01, label: 'Depth Alpha' }, noiseAlpha: { value: 0.1, min: 0, max: 1, step: 0.01, label: 'Noise Alpha' }, noiseScale: { value: 1000, min: 10, max: 2000, step: 10, label: 'Noise Scale' }, fresnelAlpha: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Fresnel Alpha' }, fresnelIntensity: { value: 0.3, min: 0, max: 2, step: 0.05, label: 'Fresnel Intensity' }, fresnelPower: { value: 2, min: 0, max: 10, step: 0.1, label: 'Fresnel Power' } }),
    bounds: folder({ boundsScale: { value: 1, min: 0.5, max: 5, step: 0.1, label: 'Bounds Scale' } }),
    metaBalls: folder({ metaballStrength: { value: 0.35, min: 0, max: 2, step: 0.01, label: 'Metaball Strength' }, metaballSubtract: { value: 6, min: 0, max: 20, step: 1, label: 'Metaball Subtract' }, pointerStrength: { value: 0.5, min: 0, max: 2, step: 0.01, label: 'Pointer Strength' }, pointerSubtract: { value: 10, min: 0, max: 20, step: 1, label: 'Pointer Subtract' }, metaballColliderRadius: { value: 0.1, min: 0.01, max: 1, step: 0.01, label: 'Metaball Collider Size' }, pointerColliderRadius: { value: 0.1, min: 0.01, max: 1, step: 0.01, label: 'Pointer Collider Size' } })
  })

  // Restore PBR lighting and add dependencies back to useMemo
  const layeredMaterial = useMemo(() => {
    const colorA = new THREE.Color(depthColorA).convertSRGBToLinear()
    const colorB = new THREE.Color(depthColorB).convertSRGBToLinear()
    const fresnelColor = new THREE.Color('white').convertSRGBToLinear()

    return new VanillaLayerMaterial({
      lighting: 'physical', // Back to physical
      side: THREE.DoubleSide,
      transmission: 1,
      roughness: roughness,
      thickness: thickness,
      ior: ior,
      layers: [
        new VertexColorLayer({ mode: 'normal' }),
        new Depth({ colorA, colorB, alpha: depthAlpha, mode: 'overlay', near: 0, far: 2, origin: new THREE.Vector3(0, 0, 0) }),
        new Noise({ mapping: 'local', type: 'simplex', scale: noiseScale, colorA: '#ffaf40', colorB: 'black', mode: 'overlay', alpha: noiseAlpha }),
        new Fresnel({ mode: 'add', color: fresnelColor, alpha: fresnelAlpha, power: fresnelPower, intensity: fresnelIntensity, bias: 0.1 })
      ]
    })
  }, [roughness, thickness, ior, depthColorA, depthColorB, depthAlpha, noiseAlpha, noiseScale, fresnelAlpha, fresnelIntensity, fresnelPower]) // Restore dependencies

  // Load the local PNG background texture
  const texture = useLoader(THREE.TextureLoader, '/assets/images/z2.jpg')
  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5] }}
      gl={{ antialias: false }}
      style={{ position: 'absolute', width: '100%', height: '100%' }}
    >
      <AdaptiveDpr min={0.5} max={1.5} />
      <AdaptiveEvents />
      <Perf position="top-left" showGraph />
      <primitive object={texture} attach="background" />
      <primitive object={texture} attach="environment" />
      <ambientLight intensity={ambientLightIntensity} />
      {/* Add directional light */}
      <directionalLight intensity={directionalLightIntensity} position={[5, 5, 5]} />
      {/* Add the controller back */}
      <CameraController fov={fov} />
      <OrbitControls />
      <Physics gravity={[0, gravity, 0]} timeStep={1/30} maxSteps={1}> {/* Throttle physics updates */}
        <MarchingCubes resolution={resolution} maxPolyCount={10000} enableUvs={false} enableColors material={layeredMaterial}>
          <MetaBall color="indianred" position={[1, 1, 0.5]} strength={metaballStrength} subtract={metaballSubtract} colliderRadius={metaballColliderRadius} />
          <MetaBall color="skyblue" position={[-1, -1, -0.5]} strength={metaballStrength} subtract={metaballSubtract} colliderRadius={metaballColliderRadius} />
          <MetaBall color="teal" position={[2, 2, 0.5]} strength={metaballStrength} subtract={metaballSubtract} colliderRadius={metaballColliderRadius} />
          <MetaBall color="orange" position={[-2, -2, -0.5]} strength={metaballStrength} subtract={metaballSubtract} colliderRadius={metaballColliderRadius} />
          <MetaBall color="hotpink" position={[3, 3, 0.5]} strength={metaballStrength} subtract={metaballSubtract} colliderRadius={metaballColliderRadius} />
          <MetaBall color="aquamarine" position={[-3, -3, -0.5]} strength={metaballStrength} subtract={metaballSubtract} colliderRadius={metaballColliderRadius} />
          <Pointer strength={pointerStrength} subtract={pointerSubtract} colliderRadius={pointerColliderRadius} />
        </MarchingCubes>
      </Physics>
      {/* Bounds conflicts with manual camera controls, comment it out */}
      <Effects />
      {/* <Bounds fit clip observe margin={1}>
        <mesh visible={false}>
          <boxGeometry />
        </mesh>
      </Bounds> */}
    </Canvas>
  )
} 