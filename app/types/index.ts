export interface ImageData {
  id: string;
  uri: string;
  position: {x: number; y: number};
  size: {width: number; height: number};
  aspectRatio: number;
  zIndex: number;
  rotation: number; // Rotation in degrees
  name: string;
  type: 'image';
  borderRadius: number;
  opacity: number;
  stickerBorderWidth: number;
  stickerBorderColor: string;
}

export interface TextData {
  id: string;
  text: string;
  fontSize: number;
  size: {width: number; height: number};
  fontWeight: 'normal' | 'bold';
  fontFamily: string;
  color: string;
  position: {x: number; y: number};
  zIndex: number;
  rotation: number; // Rotation in degrees
  name: string;
  type: 'text';
}

export type ElementData = ImageData | TextData;

export interface EditorContextType {
  elements: ElementData[];
  updateElements: (elements: ElementData[]) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  handleAddImage: (uri: string) => void;
  handleUpdateImage: (id: string, updates: Partial<ImageData>) => void;
  handleDeleteElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  handleAddText: (text: string) => void;
  handleUpdateText: (id: string, updates: Partial<TextData>) => void;
}
