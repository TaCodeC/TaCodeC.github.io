import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import glsl from 'vite-plugin-glsl';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    plugins: [glsl()],
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei', 'detect-gpu'],
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei', 'detect-gpu'],
    },
  },
  site: 'https://fernandocortes.dev',
});
