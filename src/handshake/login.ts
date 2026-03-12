import { signData } from '../crypto/signatures';

export async function respondToLoginChallenge(nonce: string) {
  const signature = await signData(nonce);

  return {
    nonce,
    signature,
  };
}
