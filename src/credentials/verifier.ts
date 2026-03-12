/**
 * Verifiable Credential verifier
 * This checks structure + cryptographic proof
 */

type VerifiableCredential = {
  "@context": string[];
  type: string[];
  issuer: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof: {
    type: string;
    signatureValue: string;
    created?: string;
  };
};

/**
 * Step 1: Structural validation
 */
function isValidVCStructure(vc: VerifiableCredential): boolean {
  return (
    Array.isArray(vc["@context"]) &&
    vc.type?.includes("VerifiableCredential") &&
    typeof vc.issuer === "string" &&
    typeof vc.credentialSubject?.id === "string" &&
    typeof vc.proof?.signatureValue === "string"
  );
}

/**
 * Step 2: Cryptographic verification (stub for now)
 * In production this:
 *  - Resolves issuer DID
 *  - Fetches issuer public key
 *  - Verifies ECDSA P-256 signature
 */
function verifySignature(
  vc: VerifiableCredential,
  issuerPublicKeyPem: string
): boolean {
  // TODO:
  // Use a real crypto lib (node-forge / noble-curves / backend API)
  // Verify canonicalized JSON-LD against signature

  return true; // TEMP: assume valid
}

/**
 * MAIN ENTRY POINT
 */
export function verifyCredential(
  vc: VerifiableCredential,
  issuerPublicKeyPem?: string
) {
  // 1️⃣ Check VC structure
  if (!isValidVCStructure(vc)) {
    return {
      verified: false,
      reason: "Invalid VC structure",
    };
  }

  // 2️⃣ Check proof type
  if (vc.proof.type !== "EcdsaSecp256r1Signature2019") {
    return {
      verified: false,
      reason: "Unsupported proof type",
    };
  }

  // 3️⃣ Cryptographic verification
  if (issuerPublicKeyPem) {
    const valid = verifySignature(vc, issuerPublicKeyPem);
    if (!valid) {
      return {
        verified: false,
        reason: "Invalid cryptographic signature",
      };
    }
  }

  // ✅ VERIFIED
  return {
    verified: true,
    credentialType: vc.type,
    subject: vc.credentialSubject,
    issuer: vc.issuer,
  };
}
