import { useState } from 'react';

export const useBiometricAuth = () => {
  const [supported] = useState(false);
  const authenticate = async (_message?: string): Promise<boolean> => false;
  return { supported, authenticate };
};

export default useBiometricAuth;
