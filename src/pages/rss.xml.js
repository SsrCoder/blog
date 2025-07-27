import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const posts = await getCollection("blog");

	return rss({
		title: 'SsrCoder\'s Blog',
		description: 'This is a blog website belongs to SsrCoder',
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/posts/${post.id}/`,
		})),
		customData: `<language>zh-cn</language>`,
	});
}

