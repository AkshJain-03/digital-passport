/**
 * Biometric Service
 *
 * Thin facade over react-native-biometrics.
 * Exposes only what the app UI layer needs; the actual Secure Enclave
 * signing stays inside src/crypto/ (do not modify).
 *
 * SECURITY RULE:
 *   - Never auto-trigger biometric prompts.
 *   - Every call to authenticate() must originate from a user gesture.
 *   - Only call createKeys() during the explicit onboarding flow.
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export type BiometryType = 'FaceID' | 'TouchID' | 'Biometrics' | 'None';

export interface BiometricCapability {
  available:    boolean;
  biometryType: BiometryType;
}

export interface BiometricAuthResult {
  success:  boolean;
  error?:   string;
}

export const biometricService = {

  /**
   * Checks device biometric capability.
   * Safe to call on mount — does NOT trigger any prompt.
   */
  async checkCapability(): Promise<BiometricCapability> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      const type: BiometryType =
        biometryType === BiometryTypes.FaceID     ? 'FaceID'     :
        biometryType === BiometryTypes.TouchID     ? 'TouchID'    :
        biometryType === BiometryTypes.Biometrics  ? 'Biometrics' :
        'None';
      return { available, biometryType: type };
    } catch {
      return { available: false, biometryType: 'None' };
    }
  },

  /**
   * Shows the biometric prompt.
   * MUST be called from an explicit user interaction (button press).
   *
   * @param reason  Human-readable string shown in the system prompt.
   */
  async authenticate(reason: string): Promise<BiometricAuthResult> {
    try {
      const { success } = await rnBiometrics.simplePrompt({ promptMessage: reason });
      return { success };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  /**
   * Returns true if biometric keys already exist for this app.
   */
  async keysExist(): Promise<boolean> {
    try {
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch {
      return false;
    }
  },
};