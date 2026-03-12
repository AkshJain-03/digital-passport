import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

/**
 * Check device biometric support
 */
export async function checkHardwareSupport() {
  const { available, biometryType } =
    await rnBiometrics.isSensorAvailable();

  return { available, biometryType };
}

/**
 * Create or reuse a hardware-backed key
 * ⚠️ This does NOT trigger Face ID (correct)
 */
export async function generateHardwareKey() {
  const { publicKey } = await rnBiometrics.createKeys();
  return publicKey;
}

/**
 * Sign data with hardware key
 * 🔐 THIS is where Face ID MUST happen
 */
export async function signData(payload: string) {
  const result = await rnBiometrics.createSignature({
    promptMessage: 'Sign with your Sovereign Identity',
    payload,
  });

  if (!result.success || !result.signature) {
    throw new Error('User cancelled or signing failed');
  }

  return result.signature;
}
