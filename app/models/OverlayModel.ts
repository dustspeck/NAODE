import {ImageData, TextData} from '../types';

export interface IParentBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface IEditorStore {
  elements: IElement[];
  isEnabled: boolean;
}

export interface IScreen {
  id: string;
  name: string;
  elements: IElement[];
}

export interface IScreensStore {
  screens: IScreen[];
  selectedIndex: number;
}

export type IElement = ImageData | TextData;
