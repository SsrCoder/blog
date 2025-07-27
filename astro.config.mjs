import { defineConfig } from 'astro/config';
import remarkToc from 'remark-toc';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: "https://blog.ssrcoder.com",

  markdown: {
    remarkPlugins: [ [remarkToc, { heading: '目录', maxDepth: 3 } ] ],
  },

  integrations: [expressiveCode()],
});