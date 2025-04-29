import {
  MMKVLoader,
  useMMKVStorage,
  ProcessingModes,
} from 'react-native-mmkv-storage';
import {IOverlay} from '../models/OverlayModel';
import {defaultOverlayAppearance} from '../utils/storage';

const MMKV = new MMKVLoader()
  .setProcessingMode(ProcessingModes.MULTI_PROCESS)
  .withInstanceID('mmkv_id')
  .initialize();

export const useOverlay = () => {
  const [storedValue, setStoredValue] = useMMKVStorage<IOverlay>(
    'OVERLAY',
    MMKV,
    defaultOverlayAppearance,
  );
  function setValues(settings: Partial<IOverlay>) {
    setStoredValue(prevSetting => ({...prevSetting, ...settings}));
  }
  return [storedValue, setValues] as const;
};
