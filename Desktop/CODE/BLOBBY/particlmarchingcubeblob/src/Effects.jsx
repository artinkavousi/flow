import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, FXAA, SMAA, SSAO, ChromaticAberration, ToneMapping, BrightnessContrast } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useControls, folder } from 'leva'

export default function Effects() {
  const { enableBloom, bloomThreshold, bloomSmoothing, bloomHeight, bloomIntensity,
          enableDOF, dofFocusDistance, dofFocalLength, dofBokehScale, dofHeight,
          enableSSAO, ssaoSamples, ssaoRings, ssaoIntensity,
          enableChromatic, chromaticOffset,
          enableToneMapping,
          enableBrightnessContrast, brightness, contrast,
          enableFXAA, enableSMAA,
          enableNoise, noiseOpacity,
          enableVignette, vignetteOffset, vignetteDarkness } = useControls('Postprocessing', {
    Bloom: folder({ enableBloom: { value: false }, bloomThreshold: { value: 0.3, min: 0, max: 1, step: 0.01 }, bloomSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 }, bloomHeight: { value: 300, min: 100, max: 1080, step: 10 }, bloomIntensity: { value: 1.2, min: 0, max: 5, step: 0.1 } }, { collapsed: true }),
    DOF: folder({ enableDOF: { value: false }, dofFocusDistance: { value: 0.02, min: 0, max: 1, step: 0.001 }, dofFocalLength: { value: 0.04, min: 0, max: 1, step: 0.001 }, dofBokehScale: { value: 2.5, min: 0, max: 10, step: 0.1 }, dofHeight: { value: 480, min: 100, max: 1080, step: 10 } }, { collapsed: true }),
    SSAO: folder({ enableSSAO: { value: false }, ssaoSamples: { value: 30, min: 0, max: 100, step: 1 }, ssaoRings: { value: 4, min: 1, max: 10, step: 1 }, ssaoIntensity: { value: 1.2, min: 0, max: 5, step: 0.1 } }, { collapsed: true }),
    Chromatic: folder({ enableChromatic: { value: false }, chromaticOffset: { value: [0.001, 0.001], step: 0.0005 } }, { collapsed: true }),
    ToneMapping: folder({ enableToneMapping: { value: false } }, { collapsed: true }),
    BrightnessContrast: folder({ enableBrightnessContrast: { value: false }, brightness: { value: 0.02, min: -1, max: 1, step: 0.01 }, contrast: { value: 0.1, min: -1, max: 1, step: 0.01 } }, { collapsed: true }),
    AntiAliasing: folder({ enableFXAA: { value: true }, enableSMAA: { value: true } }, { collapsed: false }),
    Visual: folder({ enableNoise: { value: false }, noiseOpacity: { value: 0.02, min: 0, max: 1, step: 0.01 }, enableVignette: { value: false }, vignetteOffset: { value: 0.1, min: 0, max: 1, step: 0.01 }, vignetteDarkness: { value: 0.1, min: 0, max: 5, step: 0.1 } }, { collapsed: true })
  })
  
  return (
    <EffectComposer multisampling={8} enableNormalPass>
      {enableBloom && <Bloom luminanceThreshold={bloomThreshold} luminanceSmoothing={bloomSmoothing} height={bloomHeight} intensity={bloomIntensity} blendFunction={BlendFunction.ADD} />}
      {enableDOF && <DepthOfField focusDistance={dofFocusDistance} focalLength={dofFocalLength} bokehScale={dofBokehScale} height={dofHeight} />}
      {enableSSAO && <SSAO samples={ssaoSamples} rings={ssaoRings} intensity={ssaoIntensity} />}
      {enableChromatic && <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={chromaticOffset} />}
      {enableToneMapping && <ToneMapping />}
      {enableBrightnessContrast && <BrightnessContrast brightness={brightness} contrast={contrast} />}
      {enableFXAA && <FXAA />}
      {enableSMAA && <SMAA />}
      {enableNoise && <Noise opacity={noiseOpacity} />}
      {enableVignette && <Vignette eskil={false} offset={vignetteOffset} darkness={vignetteDarkness} />}
    </EffectComposer>
  )
} 