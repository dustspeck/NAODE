import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {ToastAndroid} from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import {handleError, createError} from '../utils/errorHandling';

const APIKeys = {
  google: 'goog_BYQGyQLttTkvUuhrmnHqDOSFCSZ',
};

const ENTITLEMENT_IDS = {
  PRO: 'pro',
  PRO_FEATURES: 'PRO Features',
} as const;

interface PurchasesContextProps {
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePermissions: () => Promise<CustomerInfo>;
  user: UserState;
  packages: PurchasesPackage[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UserState {
  items: string[];
  pro: boolean;
  customerInfo: CustomerInfo | null;
  originalAppUserId: string | null;
}

const PurchaseContext = createContext<PurchasesContextProps | null>(null);

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }
  return context;
};

export const PurchasesProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<UserState>({
    items: [],
    pro: false,
    customerInfo: null,
    originalAppUserId: null,
  });
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    ToastAndroid.show(message, ToastAndroid.LONG);
  }, []);

  const getApiKey = useCallback(() => {
    return APIKeys.google;
  }, []);

  const updateCustomerInformation = useCallback(
    async (customerInfo: CustomerInfo) => {
      try {
        setUser(prevUser => {
          const newUser: UserState = {
            items: [],
            pro: false,
            customerInfo,
            originalAppUserId: customerInfo.originalAppUserId,
          };

          const proEntitlement =
            customerInfo.entitlements.active[ENTITLEMENT_IDS.PRO];
          const proFeaturesEntitlement =
            customerInfo.entitlements.active[ENTITLEMENT_IDS.PRO_FEATURES];

          if (proEntitlement || proFeaturesEntitlement) {
            newUser.pro = true;
            if (proEntitlement) {
              newUser.items.push(proEntitlement.identifier);
            }
            if (proFeaturesEntitlement) {
              newUser.items.push(proFeaturesEntitlement.identifier);
            }
          }

          Object.values(customerInfo.entitlements.active).forEach(
            entitlement => {
              if (!newUser.items.includes(entitlement.identifier)) {
                newUser.items.push(entitlement.identifier);
              }
            },
          );

          return newUser;
        });
      } catch (error) {
        handleError(error, 'updateCustomerInformation');
      }
    },
    [],
  );

  const loadOfferings = useCallback(async () => {
    try {
      setIsLoading(true);
      const offerings = await Purchases.getOfferings();

      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
        console.log(
          'Loaded packages:',
          offerings.current.availablePackages.length,
        );
      } else {
        console.warn('No current offering found');
        setError('No purchase options available at this time');
      }
    } catch (error) {
      handleError(error, 'loadOfferings');
      setError('Failed to load purchase options');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchasePackage = useCallback(
    async (pack: PurchasesPackage) => {
      try {
        setIsLoading(true);
        clearError();

        console.log('Attempting to purchase:', pack.product.identifier);

        const {customerInfo} = await Purchases.purchasePackage(pack);

        console.log('Purchase successful for:', pack.product.identifier);

        // Update user state based on entitlements
        await updateCustomerInformation(customerInfo);

        // Show success message
        const successMessage = `Successfully purchased ${pack.product.title}!`;
        ToastAndroid.show(successMessage, ToastAndroid.SHORT);
      } catch (e: any) {
        console.error('Purchase error:', e);

        // Handle RevenueCat errors
        if (e && typeof e === 'object' && 'code' in e) {
          // Handle specific RevenueCat errors
          switch (e.code) {
            case 'PURCHASE_CANCELLED_ERROR':
              console.log('Purchase was cancelled by user');
              break;
            case 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR':
              showError(
                'This product is not available for purchase. Please check your app store configuration.',
              );
              break;
            case 'STORE_PROBLEM_ERROR':
              showError(
                'There was a problem with the app store. Please try again later.',
              );
              break;
            case 'NETWORK_ERROR':
              showError(
                'Network error. Please check your internet connection and try again.',
              );
              break;
            case 'PURCHASE_INVALID_ERROR':
              showError(
                'Invalid purchase. Please contact support if this persists.',
              );
              break;
            case 'PURCHASE_NOT_ALLOWED_ERROR':
              showError(
                'Purchases are not allowed on this device. Please check your app store settings.',
              );
              break;
            default:
              showError(e.message || 'Purchase failed. Please try again.');
          }
        } else if (e.userCancelled) {
          console.log('Purchase cancelled by user');
        } else {
          showError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [updateCustomerInformation, showError, clearError],
  );

  const restorePermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();

      await updateCustomerInformation(customerInfo);

      const message = 'Purchases restored successfully!';
      ToastAndroid.show(message, ToastAndroid.SHORT);

      return customerInfo;
    } catch (error) {
      handleError(error, 'restorePermissions');
      showError('Failed to restore purchases. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInformation, showError, clearError]);

  // Initialize RevenueCat
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        const apiKey = getApiKey();
        if (!apiKey) {
          throw createError(
            'Invalid API key configuration',
            'INVALID_API_KEY',
            {platform: 'android'},
          );
        }

        console.log('Initializing RevenueCat...');
        await Purchases.configure({apiKey});
        await Purchases.syncAttributesAndOfferingsIfNeeded();

        // Set log level based on environment
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        } else {
          Purchases.setLogLevel(LOG_LEVEL.ERROR);
        }

        // Add customer info update listener
        Purchases.addCustomerInfoUpdateListener(async info => {
          console.log('Customer info updated');
          await updateCustomerInformation(info);
        });

        // Load initial customer information
        const customerInfo = await Purchases.getCustomerInfo();
        await updateCustomerInformation(customerInfo);

        // Load offerings
        await loadOfferings();

        setIsInitialized(true);
        console.log('RevenueCat initialized successfully');
      } catch (error) {
        handleError(error, 'RevenueCat initialization');
        setError('Failed to initialize purchase system');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Cleanup function
    return () => {
      // Remove listeners if needed
      console.log('Cleaning up RevenueCat listeners');
      Purchases.removeCustomerInfoUpdateListener(async info => {
        console.log('Customer info updated');
        await updateCustomerInformation(info);
      });
    };
  }, [getApiKey, updateCustomerInformation, loadOfferings]);

  const value: PurchasesContextProps = {
    purchasePackage,
    restorePermissions,
    user,
    packages,
    isLoading,
    isInitialized,
    error,
    clearError,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};
