import {MMKVLoader, ProcessingModes} from 'react-native-mmkv-storage';
import {useMMKVStorage} from 'react-native-mmkv-storage';
import {IEditorStore, IScreensStore} from '../models/OverlayModel';

const MMKV = new MMKVLoader()
  .withInstanceID('mmkv_id')
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .initialize();

// AOD Editor Store
const defaultEditorStore: IEditorStore = {
  elements: [],
  isEnabled: true,
  brightness: 0.7,
};

export const useEditorStore = () => {
  const [store, setStore] = useMMKVStorage<IEditorStore>(
    'EDITOR_STORE',
    MMKV,
    defaultEditorStore,
  );

  const setValues = (settings: Partial<IEditorStore>) => {
    setStore(prevSetting => ({...prevSetting, ...settings}));
  };

  return [store, setValues] as const;
};

// AOD Screens Store
const defaultScreensStore: IScreensStore = {
  selectedIndex: 0,
  screens: [
    {
      id: '1',
      name: 'Custom',
      elements: [],
    },
    {
      id: '2',
      name: 'Water',
      elements: [],
    },
    {
      id: '3',
      name: 'Earth',
      elements: [],
    },
    {
      id: '4',
      name: 'Fire',
      elements: [],
    },
    {
      id: '5',
      name: 'Air',
      elements: [],
    },
  ],
};

export const useScreensStore = () => {
  const [screens, setScreens] = useMMKVStorage<IScreensStore>(
    'SCREENS_STORE',
    MMKV,
    defaultScreensStore,
  );

  return {
    screens,
    setScreens,
  };
};
