// Photos uploaded before the `photos` bucket became private stored a full
// public URL in photo_url/avatar_url. Newer rows store just the storage
// path. This handles both so existing rows keep working without a backfill.
export function extractStoragePath(value: string, bucket: string): string {
  const marker = `/${bucket}/`;
  const idx = value.indexOf(marker);
  return idx === -1 ? value : value.slice(idx + marker.length);
}
