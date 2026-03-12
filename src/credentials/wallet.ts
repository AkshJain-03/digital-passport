import * as Keychain from 'react-native-keychain';

const SERVICE = 'sovereign.trust.credentials';

export async function storeCredential(vc: object) {
  await Keychain.setGenericPassword(
    'vc',
    JSON.stringify(vc),
    { service: SERVICE }
  );
}

export async function loadCredentials() {
  const result = await Keychain.getGenericPassword({
    service: SERVICE,
  });

  return result ? JSON.parse(result.password) : [];
}
