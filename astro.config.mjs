import { defineConfig } from 'astro/config';
import remarkToc from 'remark-toc';

// https://astro.build/config
export default defineConfig({
  site: "https://blog.ssrcoder.com",
  markdown: {
    remarkPlugins: [ [remarkToc, { heading: '目录', maxDepth: 3 } ] ],
  },
});
