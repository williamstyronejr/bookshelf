import slugify from 'slugify';
export function createSlug(text: string) {
  const randomStr = Math.random().toString(36).substring(0, 8);
  return slugify(`${text}-${randomStr}`, { lower: true });
}
