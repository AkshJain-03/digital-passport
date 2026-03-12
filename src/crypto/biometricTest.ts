import ReactNativeBiometrics from 'react-native-biometrics';

export async function forceFaceID(): Promise<boolean> {
  const rnBiometrics = new ReactNativeBiometrics();

  const result = await rnBiometrics.simplePrompt({
    promptMessage: 'Authenticate with Sovereign Trust Passport',
  });

  // ✅ THIS IS THE KEY FIX
  if (result.success === true) {
    return true;
  }

  return false;
}
