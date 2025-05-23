/**
 * Extracts the excerpt/preview content from a post
 * Works with both {/* more */} tags and {/* excerpt */} {/* /excerpt */} tags
 * Also handles standard MDX content by extracting the first few paragraphs
 */
export function getPostExcerpt(content: string): string {
  // If there's a "more" comment, use everything before it as the excerpt
  if (content.includes('{/* more */}')) {
    return content.split('{/* more */}')[0].trim();
  }

  // If there's an excerpt comment, use that content
  const excerptMatch = content.match(/{\/\* excerpt \*\/}([\s\S]*?){\/\* \/excerpt \*\/}/);
  if (excerptMatch && excerptMatch[1]) {
    return excerptMatch[1].trim();
  }

  // Extract the first few paragraphs, skipping frontmatter and imports
  const paragraphs = content
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/import\s+.*?from\s+['"].*?['"];?/g, '') // Remove imports
    .split('\n\n')
    .filter(p => p.trim() !== '');

  // Get the first paragraph with actual content
  const firstParagraph = paragraphs[0] || '';

  // If paragraph is very short, include the next paragraph too
  if (firstParagraph.length < 100 && paragraphs.length > 1) {
    return `${firstParagraph}\n\n${paragraphs[1]}`.trim();
  }

  // Otherwise return the first paragraph, truncated if it's too long
  return firstParagraph.length > 200 ? 
    `${firstParagraph.substring(0, 200)}...` : 
    firstParagraph;
}
