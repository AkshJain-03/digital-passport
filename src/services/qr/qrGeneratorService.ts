export type QRPayload = { id?: string; t?: string; [k: string]: any };

export const qrGeneratorService = {
  generate: (p: QRPayload) => {
    // Minimal stub — real implementation lives elsewhere.
    return JSON.stringify(p);
  },

  parseQRString: (s: string): QRPayload | null => {
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === 'object') return parsed as QRPayload;
      return null;
    } catch (e) {
      return null;
    }
  },
};

export default qrGeneratorService;
