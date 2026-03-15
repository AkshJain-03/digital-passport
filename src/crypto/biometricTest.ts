/**
 * Biometric Test Utility
 *
 * Development/diagnostic utility to check biometric hardware status.
 * Safe to call on app launch — never triggers an authentication prompt.
 *
 * Used in the Settings screen diagnostic panel.
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export interface BiometricTestResult {
  available:     boolean;
  biometryType:  string;
  keysExist:     boolean;
  error?:        string;
}

export const runBiometricTest = async (): Promise<BiometricTestResult> => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    const { keysExist } = await rnBiometrics.biometricKeysExist();

    const typeLabel =
      biometryType === BiometryTypes.FaceID    ? 'Face ID'    :
      biometryType === BiometryTypes.TouchID   ? 'Touch ID'   :
      biometryType === BiometryTypes.Biometrics? 'Biometrics' :
      'None';

    return { available, biometryType: typeLabel, keysExist };
  } catch (e) {
    return {
      available:    false,
      biometryType: 'Unknown',
      keysExist:    false,
      error:        (e as Error).message,
    };
  }
};