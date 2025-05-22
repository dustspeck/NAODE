import {MMKVLoader, ProcessingModes} from 'react-native-mmkv-storage';
import {useMMKVStorage} from 'react-native-mmkv-storage';
import {IEditorStore, IOverlay, IOverlayStore} from '../models/OverlayModel';

const MMKV = new MMKVLoader()
  .withInstanceID('mmkv_id')
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .initialize();

// const defaultOverlayStore: IOverlayStore = {
//   overlays: [],
// };

const defaultEditorStore: IEditorStore = {
  elements: [],
};

// Simple ID generation function
// const generateId = () => {
//   return (
//     Math.random().toString(36).substring(2, 15) +
//     Math.random().toString(36).substring(2, 15)
//   );
// };

// export const useOverlayStore = () => {
//   const [store, setStore] = useMMKVStorage<IOverlayStore>(
//     'OVERLAY_STORE',
//     MMKV,
//     defaultOverlayStore,
//   );

//   const addOverlay = () => {
//     const newOverlay: IOverlay = {
//       id: generateId(),
//       size: 400,
//     };
//     const newOverlays = [...store.overlays, newOverlay];
//     const newStore = {
//       ...store,
//       overlays: newOverlays,
//       activeOverlayId: newOverlay.id,
//     };
//     console.log({newStore});
//     setStore(newStore);
//   };

//   const updateOverlay = (id: string, updates: Partial<IOverlay>) => {
//     const newOverlays = store.overlays.map(overlay =>
//       overlay.id === id ? {...overlay, ...updates} : overlay,
//     );
//     const newStore = {...store, overlays: newOverlays, activeOverlayId: id};
//     console.log({newStore});
//     setStore(newStore);
//   };

//   const removeOverlay = (id: string) => {
//     const newOverlays = store.overlays.filter(overlay => overlay.id !== id);
//     setStore({
//       ...store,
//       overlays: newOverlays,
//       activeOverlayId:
//         store.activeOverlayId === id ? undefined : store.activeOverlayId,
//     });
//   };

//   const setActiveOverlay = (id: string) => {
//     setStore({
//       ...store,
//       activeOverlayId: id,
//     });
//   };

//   return {
//     store,
//     addOverlay,
//     updateOverlay,
//     removeOverlay,
//     setActiveOverlay,
//   };
// };

export const useEditorStore = () => {
  const [store, setStore] = useMMKVStorage<IEditorStore>(
    'EDITOR_STORE',
    MMKV,
    defaultEditorStore,
  );

  return {
    store,
    setStore,
  };
};
