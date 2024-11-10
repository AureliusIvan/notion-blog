export const getBlogLink = (slug: string): string => `/blog/${slug}`;

export const getDateStr = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
};

export const postIsPublished = (post: { Published?: string } | null): boolean => {
  return post?.Published === 'Yes';
};

export const normalizeSlug = (slug: string): string => {
  if (typeof slug !== 'string') return slug;

  let normalizedSlug = slug;
  if (normalizedSlug.startsWith('/')) {
    normalizedSlug = normalizedSlug.slice(1);
  }
  if (normalizedSlug.endsWith('/')) {
    normalizedSlug = normalizedSlug.slice(0, -1);
  }
  return normalizedSlug.includes('/') ? normalizeSlug(normalizedSlug) : normalizedSlug;
};
