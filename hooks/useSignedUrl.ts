import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { extractStoragePath } from '@/lib/utils/storagePath';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function useSignedUrl(pathOrUrl?: string | null, bucket = 'photos') {
  return useQuery({
    queryKey: ['signed-url', bucket, pathOrUrl],
    queryFn: async () => {
      const path = extractStoragePath(pathOrUrl as string, bucket);
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!pathOrUrl,
    staleTime: (SIGNED_URL_TTL_SECONDS - 5 * 60) * 1000,
  });
}
