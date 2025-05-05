export interface ImageData {
  id: string;
  uri: string;
  position: {x: number; y: number};
  size: {width: number; height: number};
  zIndex: number;
  rotation: number; // Rotation in degrees
}

export interface EditorContextType {
  images: ImageData[];
  selectedImageId: string | null;
  handleAddImage: (uri: string) => void;
  handleUpdateImage: (id: string, updates: Partial<ImageData>) => void;
  handleDeleteImage: (id: string) => void;
  setSelectedImageId: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
}
