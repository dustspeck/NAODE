import { ElementData } from '../types';
import { deleteImage, cleanupUnusedFiles } from './storage';
import { handleError, createError } from './errorHandling';

/**
 * Extracts the filename from a file URI
 */
const getFilenameFromUri = (uri: string): string => {
  const path = uri.replace('file://', '');
  return path.split('/').pop() || '';
};

/**
 * Gets the file path from a file URI
 */
const getFilePathFromUri = (uri: string): string => {
  return uri.replace('file://', '');
};

/**
 * Cleans up a specific image file
 */
export const cleanupImage = async (uri: string): Promise<void> => {
  try {
    const filePath = getFilePathFromUri(uri);
    await deleteImage(filePath);
  } catch (error) {
    handleError(
      error,
      'ImageCleanup:cleanupImage',
      createError('Failed to cleanup image', 'IMAGE_CLEANUP_ERROR', { uri }),
    );
  }
};

/**
 * Gets a set of filenames that are currently in use by the elements
 */
const getUsedImageFilenames = (elements: ElementData[]): Set<string> => {
  const usedFilenames = new Set<string>();
  elements.forEach(element => {
    if (element.type === 'image') {
      const filename = getFilenameFromUri(element.uri);
      if (filename) {
        usedFilenames.add(filename);
      }
    }
  });
  return usedFilenames;
};

/**
 * Cleans up unused images from the user_images directory
 */
export const cleanupUnusedImages = async (elements: ElementData[]): Promise<void> => {
  try {
    const usedFilenames = getUsedImageFilenames(elements);
    await cleanupUnusedFiles(usedFilenames);
  } catch (error) {
    handleError(
      error,
      'ImageCleanup:cleanupUnusedImages',
      createError('Failed to cleanup unused images', 'UNUSED_IMAGES_CLEANUP_ERROR'),
    );
  }
}; 