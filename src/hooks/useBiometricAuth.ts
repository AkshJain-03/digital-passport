import { useState } from 'react';

export const useBiometricAuth = () => {
  const [supported] = useState(false);
  const [biometryType] = useState<'face' | 'fingerprint' | null>(null);

  const checkSupport = async (): Promise<void> => {
    // TODO: Implement biometric support check
  };

  const authenticate = async (_message?: string): Promise<boolean> => false;

  return { supported, biometryType, checkSupport, authenticate };
};

export default useBiometricAuth;
