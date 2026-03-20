/**
 * Generate real QR code PNG files for scanning.
 *
 * Run: node scripts/generate-qr-codes.js
 */

const QRCode = require('react-native-qrcode-svg');

// We can't use react-native-qrcode-svg in Node.
// Instead, use the `qrcode` npm package.
// This is a simple script — install qrcode first:
//   npm install --save-dev qrcode

const qr = require('qrcode');
const path = require('path');

const CREDENTIALS = [
  {
    filename: 'government-id.png',
    payload: {
      type: 'credential',
      title: 'Government ID',
      issuer: 'Government of India',
      holder: 'Aksh Jain',
      issuedAt: '2024-01-15',
      expiresAt: '2034-01-15',
      trustState: 'verified',
      credentialId: 'GOV-ID-2024-AJ-001',
      country: 'India',
    },
  },
  {
    filename: 'university-degree.png',
    payload: {
      type: 'credential',
      title: 'Bachelor of Technology',
      issuer: 'IIT Bombay',
      holder: 'Aksh Jain',
      issuedAt: '2023-06-15',
      trustState: 'verified',
      credentialId: 'IITB-BTECH-2023-AJ',
      department: 'Computer Science',
      grade: 'First Class with Distinction',
    },
  },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'qr-codes');

async function generate() {
  for (const cred of CREDENTIALS) {
    const json = JSON.stringify(cred.payload);
    const filePath = path.join(OUTPUT_DIR, cred.filename);
    await qr.toFile(filePath, json, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    console.log(`✓ Generated: ${filePath}`);
  }
  console.log('\nDone! Print or display these QR codes on another screen to scan.');
}

generate().catch(console.error);
