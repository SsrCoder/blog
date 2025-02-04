// @ts-check
import { defineConfig } from 'astro/config';

import partytown from '@astrojs/partytown';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog-next.ssrcoder.com',

  // trailingSlash: 'always',
  prefetch: true,

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },

  integrations: [partytown({
    config: {
      forward: ['dataLayer.push']
    }
  }), tailwind()],
});