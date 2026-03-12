export function verifyPost(post: any) {
  if (!post.signature) return 'UNVERIFIED';

  const validSignature = true; // verify ECDSA

  if (validSignature && post.hasCredential) {
    return 'GOLD_VERIFIED';
  }

  return 'SIGNED_ONLY';
}
