/**
 * Issuer Directory
 *
 * Static registry of pre-trusted issuers bundled with the app.
 * Production version should sync from a decentralised registry.
 */

import type { Issuer } from '../models/credential';

export const ISSUER_DIRECTORY: Issuer[] = [
  {
    id: 'iitb', did: 'did:sov:IIT-Bombay-0xA1B2C3',
    name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay',
    logoEmoji: '🎓', category: 'University', country: 'IN',
    isVerified: true, trustState: 'verified', addedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'uidai', did: 'did:sov:UIDAI-GOV-0xD4E5F6',
    name: 'Unique Identification Authority of India', shortName: 'UIDAI',
    logoEmoji: '🇮🇳', category: 'Government', country: 'IN',
    isVerified: true, trustState: 'trusted', addedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'aws', did: 'did:sov:Amazon-AWS-0xG7H8I9',
    name: 'Amazon Web Services', shortName: 'AWS',
    logoEmoji: '☁️', category: 'Corporate', country: 'US',
    isVerified: true, trustState: 'verified', addedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mit', did: 'did:sov:MIT-0xP1Q2R3',
    name: 'Massachusetts Institute of Technology', shortName: 'MIT',
    logoEmoji: '🔬', category: 'University', country: 'US',
    isVerified: true, trustState: 'verified', addedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sebi', did: 'did:sov:SEBI-GOV-0xS4T5U6',
    name: 'Securities and Exchange Board of India', shortName: 'SEBI',
    logoEmoji: '📊', category: 'Government', country: 'IN',
    isVerified: true, trustState: 'trusted', addedAt: '2024-01-01T00:00:00Z',
  },
];

export const findIssuerByDid = (did: string): Issuer | undefined =>
  ISSUER_DIRECTORY.find(i => i.did === did);

export const findIssuerById = (id: string): Issuer | undefined =>
  ISSUER_DIRECTORY.find(i => i.id === id);