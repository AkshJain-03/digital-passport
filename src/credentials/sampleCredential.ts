export const sampleEmploymentCredential = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential", "EmploymentCredential"],
  issuer: "did:web:company.com",
  credentialSubject: {
    id: "did:device:sovereign-passport",
    title: "Verified Software Engineer",
  },
  proof: {
    type: "EcdsaSecp256r1Signature2019",
    signatureValue: "MEUCIQD...",
  },
};
