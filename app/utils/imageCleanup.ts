import RNFS from 'react-native-fs';
import {USER_IMAGES_PATH} from '../constants/paths';
import {ElementData} from '../types';

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
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
      console.log('Deleted image:', filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
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
    // Get list of used image filenames
    const usedFilenames = getUsedImageFilenames(elements);

    // Check if user_images directory exists
    const exists = await RNFS.exists(USER_IMAGES_PATH);
    if (!exists) {
      return;
    }

    // Get all files in the user_images directory
    const files = await RNFS.readDir(USER_IMAGES_PATH);

    // Delete files that are not in use
    for (const file of files) {
      if (!usedFilenames.has(file.name)) {
        try {
          await RNFS.unlink(file.path);
          console.log('Deleted unused image:', file.name);
        } catch (error) {
          console.error('Error deleting file:', file.name, error);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up images:', error);
  }
}; 