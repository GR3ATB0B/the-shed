import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/the-shed/',
  plugins: [react()],
  resolve: {
    dedupe: ['three'],
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    rolldownOptions: {
      output: {
        // Split the heavy 3D stack into parallel-loaded, independently
        // cacheable chunks instead of one monolithic bundle.
        advancedChunks: {
          groups: [
            {
              name: 'three',
              test: /node_modules[\\/]three[\\/]/,
              // three core is ~720kB minified; cap group size so it splits
              // into chunks under the 500kB warning threshold.
              maxSize: 1_200_000,
            },
            {
              name: 'r3f',
              test: /node_modules[\\/](@react-three|three-stdlib|postprocessing|maath|@monogrid|detect-gpu|its-fine|suspend-react|tunnel-rat|zustand|use-sync-external-store)[\\/]/,
            },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            { name: 'gsap', test: /node_modules[\\/]gsap[\\/]/ },
          ],
        },
      },
    },
  },
});
