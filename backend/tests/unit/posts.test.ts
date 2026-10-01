import { slugify, uniqueSlug } from '../../src/utils/slug.js';

describe('Unit Tests: Posts & Slug Generation', () => {
  describe('slugify()', () => {
    it('should convert standard title to lowercase kebab-case slug', () => {
      const slug = slugify('Hello World! This is a Test');
      expect(slug).toBe('hello-world-this-is-a-test');
    });

    it('should strip special characters and consecutive hyphens', () => {
      const slug = slugify('React 19 & Next.js: The Complete Guide???');
      expect(slug).toBe('react-19-next-js-the-complete-guide');
    });

    it('should strip leading and trailing hyphens', () => {
      const slug = slugify('---My Blog Post---');
      expect(slug).toBe('my-blog-post');
    });

    it('should handle empty or whitespace-only input', () => {
      const slug = slugify('   ');
      expect(slug).toBe('');
    });
  });

  describe('uniqueSlug()', () => {
    it('should return base slug if not already taken', async () => {
      const existsMock = async (_candidate: string) => false;
      const slug = await uniqueSlug('Clean Code Architecture', existsMock);
      expect(slug).toBe('clean-code-architecture');
    });

    it('should append numeric suffix if base slug already exists', async () => {
      const existingSlugs = new Set(['clean-code-architecture', 'clean-code-architecture-1']);
      const existsMock = async (candidate: string) => existingSlugs.has(candidate);

      const slug = await uniqueSlug('Clean Code Architecture', existsMock);
      expect(slug).toBe('clean-code-architecture-2');
    });

    it('should fallback to post if title is empty or stripped', async () => {
      const existsMock = async (_candidate: string) => false;
      const slug = await uniqueSlug('???', existsMock);
      expect(slug).toBe('post');
    });
  });
});
