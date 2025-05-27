import RNFS from 'react-native-fs';
import { AOD_IMAGE_PATH, USER_IMAGES_PATH } from '../constants/paths';
import { handleError, createError } from './errorHandling';

export const ensureDirectoryExists = async (path: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(path);
    if (!exists) {
      await RNFS.mkdir(path);
    }
  } catch (error) {
    handleError(
      error,
      'Storage:ensureDirectoryExists',
      createError('Failed to create directory', 'DIR_CREATE_ERROR', { path }),
    );
    throw error;
  }
};

export const saveImage = async (
  uri: string,
  targetPath: string,
  quality: number = 1,
): Promise<string> => {
  try {
    await ensureDirectoryExists(AOD_IMAGE_PATH);
    await RNFS.moveFile(uri, targetPath);
    return targetPath;
  } catch (error) {
    handleError(
      error,
      'Storage:saveImage',
      createError('Failed to save image', 'IMAGE_SAVE_ERROR', {
        uri,
        targetPath,
        quality,
      }),
    );
    throw error;
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path);
    }
  } catch (error) {
    handleError(
      error,
      'Storage:deleteImage',
      createError('Failed to delete image', 'IMAGE_DELETE_ERROR', { path }),
    );
    throw error;
  }
};

export const cleanupUnusedFiles = async (usedPaths: Set<string>): Promise<void> => {
  try {
    await ensureDirectoryExists(USER_IMAGES_PATH);
    const files = await RNFS.readDir(USER_IMAGES_PATH);

    for (const file of files) {
      if (!usedPaths.has(file.path)) {
        await deleteImage(file.path);
      }
    }
  } catch (error) {
    handleError(
      error,
      'Storage:cleanupUnusedFiles',
      createError('Failed to cleanup unused files', 'CLEANUP_ERROR'),
    );
    throw error;
  }
}; 