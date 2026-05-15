import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/the-shed/',
  plugins: [react()],
  resolve: {
    dedupe: ['three'],
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
});
