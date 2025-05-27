import {CaptureOptions} from 'react-native-view-shot';
import {ImageLibraryOptions} from 'react-native-image-picker';
import {getRandomString} from '../utils/common';
import {USER_IMAGES_PATH} from './paths';

export const EDIT_WINDOW_RATIO = 0.78;
export const EDIT_CONTROLS_RATIO = (1 - EDIT_WINDOW_RATIO) / 2;
export const MIN_IMAGE_SIZE = 50;
export const MAX_FONT_SIZE = 300;
export const MIN_FONT_SIZE = 10;
export const DEFAULT_FONT_SIZE = 30;
export const PREVIEW_IMAGE_RATIO = 0.6;

export const FONTS = [
  {name: 'Roboto Regular', fontFamily: 'RobotoRegular'},
  {name: 'Playwrite DK Loopet', fontFamily: 'PlaywriteDKLoopet'},
  {name: 'Archivo Black', fontFamily: 'ArchivoBlack'},
  {name: 'Codystar', fontFamily: 'Codystar'},
  {name: 'Roboto Slab', fontFamily: 'RobotoSlab'},
  {name: 'DMSerif Display', fontFamily: 'DMSerifDisplay'},
  {name: 'Edu QLD', fontFamily: 'EduQLD'},
  {name: 'Lobster', fontFamily: 'Lobster'},
  {name: 'Montserrat', fontFamily: 'Montserrat'},
  {name: 'Pacifico', fontFamily: 'Pacifico'},
  {name: 'Dancing Script', fontFamily: 'DancingScript'},
  {name: 'Comfortaa', fontFamily: 'Comfortaa'},
];

export const DEFAULT_TEXT_VALUE = 'Hello';

export const getHighQualityImageProps = (
  width: number,
  height: number,
): CaptureOptions => {
  return {
    format: 'png',
    quality: 1,
    width: width,
    height: height,
  };
};

export const getPreviewImageProps = (
  width: number,
  height: number,
): CaptureOptions => {
  return {
    format: 'png',
    quality: 0.8,
    width: width * PREVIEW_IMAGE_RATIO,
    height: height * PREVIEW_IMAGE_RATIO,
  };
};

export const getImageLibraryOptions = (): ImageLibraryOptions => {
  return {
    mediaType: 'photo',
    quality: 1,
  };
};

export const getUserImageURI = (uri: string) => {
  const timestamp = Date.now();
  const randomString = getRandomString();
  const extension = uri.split('.').pop();
  const newFilename = `user_image_${timestamp}_${randomString}.${extension}`;
  const newPath = `${USER_IMAGES_PATH}/${newFilename}`;
  return `file://${newPath}`;
};
