import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

// See: https://github.com/withastro/astro/tree/main/packages/astro-rss
export async function GET(context) {
  const blogs = await getCollection('posts', ({ data }) => {
    return data.draft !== true;
  })

  return rss ({
    title: "SsrCoder's Blog",
    description: "SsrCoder's Blog", // TODO: 
    site: context.site,
    items: blogs.map((post) => ({
      author: "SsrCoder",
      title: post.data.title,
      pubDate: post.data.published,
      description: post.data.description,
      // 从 `id` 属性计算出 RSS 链接
      // 这个例子假设所有的文章都被渲染为 `/blog/[id]` 路由
      link: `/blog/${post.id}`,
    })).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)),
    customData: `<language>zh-cn</language>`,
  })
}
