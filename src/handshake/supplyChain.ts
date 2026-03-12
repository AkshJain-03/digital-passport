import { signData } from '../crypto/signatures';

export async function dualSignTransfer(
  productId: string
) {
  const senderSig = await signData(productId);
  const receiverSig = await signData(productId);

  return {
    productId,
    senderSig,
    receiverSig,
    timestamp: Date.now(),
  };
}
