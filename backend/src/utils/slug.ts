export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function uniqueSlug(
  base: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugify(base) || 'post';
  let candidate = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await existsFn(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
