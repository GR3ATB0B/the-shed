import {
  EffectComposer,
  Vignette,
  BrightnessContrast,
  HueSaturation,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      <HueSaturation hue={-0.02} saturation={0.04} />
      <BrightnessContrast brightness={-0.02} contrast={0.0} />
      <Vignette
        offset={0.18}
        darkness={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
