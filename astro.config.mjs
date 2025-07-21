import { defineConfig } from 'astro/config';
import remarkToc from 'remark-toc';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [ [remarkToc, { heading: '目录', maxDepth: 3 } ] ],
  },
});
