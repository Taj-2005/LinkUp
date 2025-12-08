import { isValidImageUrl } from "./linkCacheMutations";

export function safeMergeLinkUpdate<T extends { _id: string | { toString(): string }; imageUrl?: string | null }>(
  existingLink: T,
  update: Partial<T>
): T {
  const existingImageUrl = existingLink.imageUrl as string | null | undefined;
  const updateImageUrl = update.imageUrl as string | null | undefined;
  
  const preservedImageUrl = 
    isValidImageUrl(updateImageUrl) 
      ? updateImageUrl 
      : (isValidImageUrl(existingImageUrl) ? existingImageUrl : existingImageUrl);

  return {
    ...existingLink,
    ...update,
    imageUrl: preservedImageUrl,
  } as T;
}

export function ensureCompleteLink<T extends { _id?: string | { toString(): string }; imageUrl?: string | null }>(
  existingLink: T | undefined,
  partialUpdate: Partial<T>,
  fallbackImageUrl?: string
): T | undefined {
  if (!existingLink && !partialUpdate._id) {
    return undefined;
  }

  if (!existingLink) {
    return {
      ...partialUpdate,
      imageUrl: isValidImageUrl(partialUpdate.imageUrl) 
        ? partialUpdate.imageUrl 
        : (fallbackImageUrl || ""),
    } as T;
  }

  if (!existingLink._id) {
    return {
      ...partialUpdate,
      imageUrl: isValidImageUrl(partialUpdate.imageUrl) 
        ? partialUpdate.imageUrl 
        : (isValidImageUrl(existingLink.imageUrl) ? existingLink.imageUrl : fallbackImageUrl || ""),
    } as T;
  }

  return safeMergeLinkUpdate(existingLink as T & { _id: string | { toString(): string } }, partialUpdate) as T;
}

