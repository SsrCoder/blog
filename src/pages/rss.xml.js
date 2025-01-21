import rss, { pagesGlobToRssItems } from '@astrojs/rss'

// See: https://github.com/withastro/astro/tree/main/packages/astro-rss
export async function GET(context) {
  return rss ({
    title: "SsrCoder's Blog",
    description: "SsrCoder's Blog", // TODO: 
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>zh-cn</language>`,
  })
}

