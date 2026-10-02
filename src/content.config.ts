import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    authorBio: z.string().optional(),
    authorGitHub: z.string().optional(),
    category: z.enum([
      'Windows Security',
      'Vulnerability Management',
      'Windows Server',
      'Nessus & Tenable',
      'Hardening & Compliance',
      'Lab Experiments',
    ]),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
