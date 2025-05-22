import {ImageData, TextData} from '../types';

export interface IParentBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface IEditorStore {
  elements: IElement[];
}

export interface IScreen {
  id: string;
  name: string;
  elements: IElement[];
}

export interface IScreensStore {
  screens: IScreen[];
}

export type IElement = ImageData | TextData;
