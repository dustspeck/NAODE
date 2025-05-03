export interface ImageData {
  id: string;
  uri: string;
  position: {x: number; y: number};
  size: {width: number; height: number};
}

export interface EditorContextType {
  images: ImageData[];
  selectedImageId: string | null;
  handleAddImage: (uri: string) => void;
  handleUpdateImage: (id: string, updates: Partial<ImageData>) => void;
  handleDeleteImage: (id: string) => void;
  setSelectedImageId: (id: string | null) => void;
}
