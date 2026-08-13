import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface StorageImageProps extends Omit<ImageProps, 'source'> {
  path?: string | null;
  bucket?: string;
}

export function StorageImage({ path, bucket = 'photos', ...imageProps }: StorageImageProps) {
  const { data: signedUrl } = useSignedUrl(path, bucket);

  if (!signedUrl) return null;

  return <Image source={{ uri: signedUrl }} {...imageProps} />;
}
