/**
 * Calculates estimated reading time in minutes from markdown or plain text.
 * Average reading speed: 230 words per minute.
 * Always returns at least 1 minute.
 */
export function getReadingTime(content?: string): number {
  if (!content || typeof content !== 'string') {
    return 1;
  }

  // Remove code blocks and markdown symbols for cleaner word count
  const cleanText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`.*?`/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~-]/g, ' ')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 230));
}
