import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/auth/supabase';
import { PhotoLog } from '@/types';
import { extractStoragePath } from '@/lib/utils/storagePath';
import { useBaby } from './useBaby';

const STORAGE_BUCKET = 'photos';

export function usePhotos() {
  const { baby } = useBaby();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos', baby?.id],
    queryFn: async () => {
      if (!baby) return [];

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('baby_id', baby.id)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PhotoLog[];
    },
    enabled: !!baby,
  });

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Photo library access is required to add photos');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return result.assets[0];
  };

  const uploadPhoto = async (uri: string, mimeType: string | undefined, caption?: string) => {
    if (!baby) throw new Error('No baby selected');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${baby.id}/${Date.now()}.${fileExt}`;
    const contentType = mimeType || `image/${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, arrayBuffer, { contentType });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('photos')
      .insert({
        baby_id: baby.id,
        created_by: user.id,
        photo_url: fileName,
        caption: caption || null,
        category: 'everyday',
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['photos', baby.id] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
    queryClient.invalidateQueries({ queryKey: ['log-entries'] });
    return data as PhotoLog;
  };

  const deletePhoto = async (photo: PhotoLog) => {
    const { error } = await supabase.from('photos').delete().eq('id', photo.id);
    if (error) throw error;

    // Best-effort cleanup of the stored file; ignore failures since the
    // record is already gone from the app's perspective.
    const path = extractStoragePath(photo.photo_url, STORAGE_BUCKET);
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    } catch {
      // ignore
    }

    queryClient.invalidateQueries({ queryKey: ['photos', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
    queryClient.invalidateQueries({ queryKey: ['log-entries'] });
  };

  return {
    photos,
    isLoading,
    pickPhoto,
    uploadPhoto,
    deletePhoto,
  };
}
