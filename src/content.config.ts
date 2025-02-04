// 1. 从 `astro:content` 导入工具函数
import { defineCollection, z } from 'astro:content';

// 2. 导入加载器
import { glob, file } from 'astro/loaders';

// 3. 定义你的集合
const posts = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/pages/posts" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        published: z.coerce.date(),
        draft: z.boolean().optional(),
        image: z.object({
            src: z.string(),
            alt: z.string(),
        }).optional(),
        // updatedDate: z.coerce.date().optional(),
    })
});
// const dogs = defineCollection({ /* ... */ });

// 4. 导出一个 `collections` 对象来注册你的集合
export const collections = { posts };