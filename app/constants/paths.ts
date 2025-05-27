import RNFS from 'react-native-fs';

export const AOD_IMAGE_PATH = `${RNFS.DocumentDirectoryPath}/aod`;
export const AOD_PREVIEW_IMAGE_PATH = `${RNFS.DocumentDirectoryPath}/aod`;
export const GALLERY_IMAGE_PATH = `${RNFS.PicturesDirectoryPath}/Aodes`;
export const USER_IMAGES_PATH = `${RNFS.DocumentDirectoryPath}/user_images`;


export const getRenderedImagePath = (id: string, type: 'aod' | 'aodpreview') => {
  return `${AOD_IMAGE_PATH}/${type}_${id}.png`;
};

export const getGalleryImagePath = (id: string) => {
  return `${GALLERY_IMAGE_PATH}/Aodes_${id}_${Date.now()}.png`;
};