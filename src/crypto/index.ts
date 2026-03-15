export { signPayload, signChallenge, verifySignature, getPublicKey } from './signatures';
export type { SignatureResult, VerifySignatureParams }               from './signatures';

export { runBiometricTest }  from './biometricTest';
export type { BiometricTestResult } from './biometricTest';