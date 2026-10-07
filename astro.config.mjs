import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://forum.shr3wd.workers.dev',
  output: 'static',
  build: {
    assets: '_assets',
  },
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: true,
    },
  },
});
