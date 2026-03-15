/**
 * Route constants
 *
 * All screen names in one place — import ROUTES everywhere so
 * a rename never breaks a string in a navigate() call.
 */

export const ROUTES = {
  // ── Tab screens ─────────────────────────────────────────────────────────
  HOME:        'Home',
  SCAN:        'Scan',
  PASSPORT:    'Passport',
  VERIFY:      'Verify',
  TRUTH_FEED:  'TruthFeed',

  // ── Stack screens ────────────────────────────────────────────────────────
  HANDSHAKE:           'Handshake',
  CREDENTIAL_LIST:     'CredentialList',
  CREDENTIAL_DETAIL:   'CredentialDetail',
  PRODUCT_DETAIL:      'ProductDetail',
  SETTINGS:            'Settings',
  VISION:              'Vision',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteName = typeof ROUTES[RouteKey];

// ─── Navigator param lists ─────────────────────────────────────────────────

export type TabParamList = {
  [ROUTES.HOME]:       undefined;
  [ROUTES.SCAN]:       undefined;
  [ROUTES.PASSPORT]:   undefined;
  [ROUTES.VERIFY]:     undefined;
  [ROUTES.TRUTH_FEED]: undefined;
};

export type RootStackParamList = {
  MainTabs:                    undefined;
  [ROUTES.HANDSHAKE]:          { rawQR?: string };
  [ROUTES.CREDENTIAL_LIST]:    undefined;
  [ROUTES.CREDENTIAL_DETAIL]:  { credentialId: string };
  [ROUTES.PRODUCT_DETAIL]:     { productId: string };
  [ROUTES.SETTINGS]:           undefined;
  [ROUTES.VISION]:             undefined;
};