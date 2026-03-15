/**
 * HandshakeScreen
 *
 * Passwordless DID-auth login flow:
 *   1. Parse challenge QR (auto-loaded in dev via DEMO_QR)
 *   2. Show verifier name, scope chips, nonce preview, expiry
 *   3. User taps "Authenticate" → biometric prompt (explicit gesture)
 *   4. Sign nonce with hardware key → show result
 *
 * SECURITY: biometric is ONLY triggered by explicit button press.
 * This hook never auto-fires.
 */

import React, { useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }           from '../../theme/colors';
import { radius }           from '../../theme/radius';
import { GlassCard }        from '../../components/common/GlassCard';
import { AppButton }        from '../../components/common/AppButton';
import { AppBadge }         from '../../components/common/AppBadge';
import { LoadingState }     from '../../components/common/LoadingState';
import { useHandshakeFlow } from '../../hooks/useHandshakeFlow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title2:   t.title2    ?? {},
  title3:   t.title3    ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.bodySm    ?? t.body      ?? {},
  caption:  t.captionSm ?? t.caption   ?? {},
  label:    t.label     ?? {},
  mono:     t.mono      ?? {},
};

// Demo challenge for dev preview
const DEMO_QR = JSON.stringify({
  nonce:        'abc123def456ghi789jkl012',
  issuedAt:     new Date().toISOString(),
  expiresAt:    new Date(Date.now() + 120_000).toISOString(),
  verifierDid:  'did:sov:Acme-Corp-0xV1',
  verifierName: 'Acme Corp Portal',
  scope:        ['name', 'email', 'employmentCredential'],
});

export const HandshakeScreen: React.FC = () => {
  const { step, handshake, error, parseChallenge, sign, reset } = useHandshakeFlow();

  // Auto-parse demo QR on mount for preview (dev only)
  useEffect(() => {
    if (step === 'idle') parseChallenge(DEMO_QR);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const glowState =
    step === 'completed' ? 'verified' :
    step === 'error'     ? 'revoked'  :
    'trusted';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Login Request</Text>
          <Text style={styles.sub}>A verifier is requesting access to your credentials</Text>
        </View>

        {/* ── Challenge card ────────────────────────────────────────────── */}
        {handshake && (
          <GlassCard
            glowState={glowState}
            animateGlow
            padding="md"
            style={styles.challengeCard}
          >
            {/* Verifier identity */}
            <View style={styles.verifierRow}>
              <View style={styles.verifierIcon}>
                <Text style={styles.verifierEmoji}>🏢</Text>
              </View>
              <View style={styles.verifierBody}>
                <Text style={styles.verifierName}>{handshake.challenge.verifierName}</Text>
                <Text style={styles.verifierDid} numberOfLines={1}>
                  {handshake.challenge.verifierDid}
                </Text>
              </View>
              <AppBadge label="Login Request" variant="trusted" size="sm" />
            </View>

            {/* Requested scope */}
            {handshake.challenge.scope.length > 0 && (
              <View style={styles.scopeSection}>
                <Text style={styles.sectionLabel}>REQUESTED ACCESS</Text>
                <View style={styles.scopeChips}>
                  {handshake.challenge.scope.map(s => (
                    <View key={s} style={styles.scopeChip}>
                      <Text style={styles.scopeChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Expiry + nonce */}
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Expires</Text>
                <Text style={styles.metaValue}>
                  {new Date(handshake.challenge.expiresAt).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Nonce</Text>
                <Text style={styles.metaNonce}>
                  {handshake.challenge.nonce.slice(0, 14)}…
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* ── Signing / loading ─────────────────────────────────────────── */}
        {(step === 'signing' || step === 'awaiting_biometric') && (
          <LoadingState
            message={
              step === 'awaiting_biometric'
                ? 'Waiting for biometric…'
                : 'Signing with hardware key…'
            }
          />
        )}

        {/* ── Success ───────────────────────────────────────────────────── */}
        {step === 'completed' && (
          <GlassCard glowState="verified" padding="md" style={styles.resultCard}>
            <Text style={styles.resultIconText}>✓</Text>
            <Text style={styles.resultTitle}>Authentication Complete</Text>
            <Text style={styles.resultDetail}>
              Challenge signed with your hardware key and sent to {handshake?.challenge.verifierName}.
            </Text>
            {handshake?.response?.signature && (
              <Text style={styles.resultMono}>
                Sig: {handshake.response.signature.slice(0, 22)}…
              </Text>
            )}
          </GlassCard>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {(step === 'error' || error) && (
          <GlassCard glowState="revoked" padding="md" style={styles.resultCard}>
            <Text style={[styles.resultIconText, { color: colors.trust.revoked.solid }]}>✕</Text>
            <Text style={[styles.resultTitle, { color: colors.trust.revoked.solid }]}>
              Authentication Failed
            </Text>
            <Text style={styles.resultDetail}>{error ?? 'Unknown error'}</Text>
          </GlassCard>
        )}

        {/* ── CTA — MUST be explicit user tap ───────────────────────────── */}
        <View style={styles.actions}>
          {step === 'challenge_parsed' && (
            <AppButton
              label="Authenticate with Biometrics"
              onPress={sign}
              variant="primary"
              fullWidth
            />
          )}
          {(step === 'completed' || step === 'error') && (
            <AppButton label="Done" onPress={reset} variant="secondary" fullWidth />
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg.base,
    paddingTop:      Platform.OS === 'ios' ? 60 : 40,
  },
  scroll: { paddingHorizontal: 16 },

  header: { marginBottom: 20 },
  title:  { ...typo.title2, color: colors.text.primary },
  sub:    { ...typo.body,   color: colors.text.tertiary, marginTop: 3 },

  // Challenge card
  challengeCard: { marginBottom: 16 },

  // Verifier row
  verifierRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  verifierIcon: {
    width:           44,
    height:          44,
    borderRadius:    radius.xl,
    backgroundColor: colors.glass.medium,
    borderWidth:     1,
    borderColor:     colors.border.light,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  verifierEmoji: { fontSize: 22 },
  verifierBody:  { flex: 1 },
  verifierName:  { ...typo.headline, color: colors.text.primary },
  verifierDid:   { ...typo.mono, fontSize: 9, color: colors.text.quaternary, marginTop: 2 },

  // Scope
  scopeSection: { marginBottom: 12 },
  sectionLabel: { ...typo.label, color: colors.text.quaternary, marginBottom: 8 },
  scopeChips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  scopeChip: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    backgroundColor:   colors.brand.primaryDim,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       `${colors.brand.primary}40`,
  },
  scopeChipText: { ...typo.caption, color: colors.brand.primary, fontWeight: '600' },

  // Meta
  metaGrid: { gap: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { ...typo.caption, color: colors.text.quaternary },
  metaValue: { ...typo.caption, color: colors.text.secondary },
  metaNonce: { ...typo.mono, fontSize: 10, color: colors.text.tertiary },

  // Result
  resultCard:   { marginBottom: 16, alignItems: 'center', paddingVertical: 24 },
  resultIconText: {
    fontSize:     36,
    color:        colors.trust.verified.solid,
    marginBottom: 8,
  },
  resultTitle:  { ...typo.title3, color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  resultDetail: { ...typo.body, color: colors.text.tertiary, textAlign: 'center' },
  resultMono:   { ...typo.mono, fontSize: 10, color: colors.text.quaternary, marginTop: 8 },

  actions: { gap: 12 },
});

export default HandshakeScreen;
