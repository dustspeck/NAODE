export interface IOverlay {
  id: string;
  size: number;
  customImagePath?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface IOverlayStore {
  overlays: IOverlay[];
  activeOverlayId?: string;
}
