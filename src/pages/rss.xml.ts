import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  const sorted = blog.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return rss({
    title: 'shr3wd. — Security, Tested.',
    description: 'Practical cybersecurity lab experiments, Windows security hardening, vulnerability management, and evidence-driven research.',
    site: context.site || 'https://forum.shr3wd.workers.dev',
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id.replace(/\.md$/, '')}/`,
      categories: [post.data.category, ...(post.data.tags || [])],
    })),
    customData: '<language>en-us</language>',
  });
}
