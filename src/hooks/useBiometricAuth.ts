import { useCallback, useState } from 'react';
import { biometricService, type BiometryType } from '../services/biometric/biometricService';

export const useBiometricAuth = () => {
  const [supported, setSupported] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);

  const mapType = (type: BiometryType): string | null => {
    if (type === 'FaceID') return 'face';
    if (type === 'TouchID') return 'fingerprint';
    if (type === 'Biometrics') return 'fingerprint';
    return null;
  };

  const checkSupport = useCallback(async (): Promise<void> => {
    const capability = await biometricService.checkCapability();
    setSupported(capability.available);
    setBiometryType(mapType(capability.biometryType));
  }, []);

  const authenticate = useCallback(async (message?: string): Promise<boolean> => {
    const prompt = message ?? 'Authenticate to continue';
    const result = await biometricService.authenticate(prompt);
    return result.success;
  }, []);

  return { supported, biometryType, checkSupport, authenticate };
};

export default useBiometricAuth;
