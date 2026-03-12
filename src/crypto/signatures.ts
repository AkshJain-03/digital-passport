import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export async function signData(payload: string) {
  const result = await rnBiometrics.createSignature({
    promptMessage: 'Authenticate with Sovereign Trust Passport',
    payload,
  });

  return result.signature;
}
