
import { getCollection } from 'astro:content'

async function getAllPosts() {
    let allPosts = await getCollection('posts', ({ data }) => {
        return data.draft !== true;
    })

    allPosts = allPosts.sort((a, b) => new Date(b.data.published).getTime() - new Date(a.data.published).getTime());

    return allPosts;
}

export { getAllPosts }
