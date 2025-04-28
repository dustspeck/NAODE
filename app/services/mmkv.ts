import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';
import {IOverlay} from '../models/OverlayModel';
import {defaultOverlayAppearance} from '../utils/storage';
const MMKV = new MMKVLoader().initialize();

export const useOverlay = () => {
  const [storedValue, setStoredValue] = useMMKVStorage<IOverlay>(
    'OVERLAY',
    MMKV,
    defaultOverlayAppearance,
  );
  function setValues(settings: IOverlay) {
    setStoredValue(prevSetting => ({...prevSetting, ...settings}));
  }
  return [storedValue, setValues] as const;
};
