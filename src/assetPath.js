import { useGLTF } from '@react-three/drei';

const BASE = import.meta.env.BASE_URL || '/';

export function assetUrl(path) {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE}${clean}`;
}

export const DRACO_DECODER_PATH = assetUrl('draco/');

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
