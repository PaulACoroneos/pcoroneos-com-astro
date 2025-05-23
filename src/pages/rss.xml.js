/**
 * This is a dynamic RSS feed with all blog posts
 * We use caching headers to ensure new blog posts and edits automatically show up
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');
  
  // Sort posts by date (newest first)
  blog.sort((a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf());
  
  const feed = rss({
    title: 'Blog – Paul Coroneos',
    description: 'Personal blog and portfolio for Paul Coroneos.',
    site: context.site || 'https://pcoroneos.com',
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags || [],
      author: post.data.author || 'Paul Coroneos',
    })),
    customData: `
      <language>en-us</language>
      <copyright>©${new Date().getFullYear()} Paul Coroneos</copyright>
    `.trim(),
  });
  
  // Set cache control headers similar to Next.js implementation
  const cacheMaxAgeUntilStaleSeconds = 60; // 1 minute
  const cacheMaxAgeStaleDataReturnSeconds = 60 * 60; // 60 minutes
  
  context.response.headers.set(
    'Cache-Control',
    `public, s-maxage=${cacheMaxAgeUntilStaleSeconds}, stale-while-revalidate=${cacheMaxAgeStaleDataReturnSeconds}`
  );
  
  return feed;
}