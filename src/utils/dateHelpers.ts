/**
 * Date Helpers
 *
 * Focused date utilities for credential and handshake validity logic.
 */

import { CREDENTIAL_EXPIRY_WARN_DAYS } from '../constants/appConstants';

/** Returns true if the ISO date string is in the past */
export const isExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

/** Returns true if expiry is within the warning window but not yet expired */
export const isNearExpiry = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false;
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  return msLeft > 0 && msLeft < CREDENTIAL_EXPIRY_WARN_DAYS * 86_400_000;
};

/** Returns days until expiry, or null if no expiry set */
export const daysUntilExpiry = (expiresAt: string | null | undefined): number | null => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
};

/** Returns the ISO string for N days from now */
export const inDays = (n: number): string =>
  new Date(Date.now() + n * 86_400_000).toISOString();

/** Returns the ISO string for N minutes from now (for handshake TTL) */
export const inMinutes = (n: number): string =>
  new Date(Date.now() + n * 60_000).toISOString();