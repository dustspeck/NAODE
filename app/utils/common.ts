import {IElement, IScreensStore} from '../models/OverlayModel';
import { USER_IMAGES_PATH } from '../constants/paths';

export function isEqual(a: any, b: any) {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return false;

  // Compare dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Compare arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // One is array and one is not
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Compare objects
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (let key of aKeys) {
    if (!b.hasOwnProperty(key)) return false;
    if (!isEqual(a[key], b[key])) return false;
  }

  return true;
}

export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function renameScreen(
  screens: IScreensStore['screens'],
  screenIndex: number,
  newName: string,
) {
  return screens.map((screen, index) => {
    if (index === screenIndex) {
      return {
        ...screen,
        name: newName,
      };
    }
    return screen;
  });
}

export function updateScreen(
  screens: IScreensStore['screens'],
  screenIndex: number,
  elements: IElement[],
) {
  return {
    screens: screens.map((screen, index) =>
      index === screenIndex
        ? {
            ...screen,
            elements: elements,
          }
        : screen,
    ),
    selectedIndex: screenIndex,
  };
}

export function getRandomString() {
  return Math.random().toString(36).substring(7);
}

export function getImageName(uri: string) {
  return uri.split('/').pop()?.split('.')[0];
}

export function getStickerURI(uri: string) {
  const imageName = getImageName(uri);
  return `file://${USER_IMAGES_PATH}/${imageName}_sticker.png`;
}

export function isStickerURI(uri: string) {
  return uri.includes('_sticker.png');
}