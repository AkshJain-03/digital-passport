/**
 * HandshakeScreen
 *
 * Passwordless login flow:
 *   1. Parse challenge QR (or receive rawQR via navigation params)
 *   2. Show challenge details (verifier name, scope, expiry)
 *   3. User taps "Authenticate with Face ID / Touch ID"
 *   4. Biometric prompt fires (EXPLICIT user gesture)
 *   5. Sign nonce and show success / error result
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

import { colors }            from '../../theme/colors';
import { radius }            from '../../theme/radius';
import { spacing }           from '../../theme/spacing';
import { typography }        from '../../theme/typography';
import { shadows }           from '../../theme/shadows';
import { GlassCard }         from '../../components/common/GlassCard';
import { AppButton }         from '../../components/common/AppButton';
import { AppBadge }          from '../../components/common/AppBadge';
import { LoadingState }      from '../../components/common/LoadingState';
import { useHandshakeFlow }  from '../../hooks/useHandshakeFlow';

// Demo challenge QR for testing the flow
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

  // Auto-parse demo QR on mount for preview
  useEffect(() => {
    if (step === 'idle') parseChallenge(DEMO_QR);
  }, []);    // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Login Request</Text>
          <Text style={styles.sub}>A verifier is requesting access to your credentials</Text>
        </View>

        {/* Challenge card */}
        {handshake && (
          <GlassCard
            glowState={
              step === 'completed' ? 'verified'
                : step === 'error' ? 'revoked'
                : 'trusted'
            }
            style={styles.challengeCard}
          >
            {/* Verifier row */}
            <View style={styles.verifierRow}>
              <View style={styles.verifierIcon}>
                <Text style={styles.verifierEmoji}>🏢</Text>
              </View>
              <View style={styles.verifierBody}>
                <Text style={styles.verifierName}>
                  {handshake.challenge.verifierName ?? 'Unknown Verifier'}
                </Text>
                <Text style={styles.verifierDid} numberOfLines={1}>
                  {handshake.challenge.verifierDid}
                </Text>
              </View>
              <AppBadge
                label={step === 'completed' ? 'Signed' : step === 'error' ? 'Failed' : 'Pending'}
                variant={step === 'completed' ? 'verified' : step === 'error' ? 'revoked' : 'pending'}
                dot
              />
            </View>

            {/* Scope */}
            <View style={styles.scopeSection}>
              <Text style={styles.sectionLabel}>REQUESTED CLAIMS</Text>
              <View style={styles.scopeChips}>
                {handshake.challenge.scope.map(s => (
                  <View key={s} style={styles.scopeChip}>
                    <Text style={styles.scopeChipText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Expiry */}
            <View style={styles.expiryRow}>
              <Text style={styles.expiryLabel}>Expires</Text>
              <Text style={styles.expiryValue}>
                {new Date(handshake.challenge.expiresAt).toLocaleTimeString()}
              </Text>
            </View>

            {/* Nonce preview */}
            <View style={styles.nonceRow}>
              <Text style={styles.expiryLabel}>Nonce</Text>
              <Text style={styles.nonce}>
                {handshake.challenge.nonce.slice(0, 12)}…
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Signing state */}
        {(step === 'signing' || step === 'awaiting_biometric') && (
          <LoadingState message={
            step === 'awaiting_biometric' ? 'Waiting for biometrics…' : 'Signing with hardware key…'
          } />
        )}

        {/* Success */}
        {step === 'completed' && (
          <GlassCard glowState="verified" style={styles.resultCard}>
            <Text style={styles.resultIcon}>✓</Text>
            <Text style={styles.resultTitle}>Authentication Complete</Text>
            <Text style={styles.resultDetail}>
              Challenge signed with your hardware key and sent to {handshake?.challenge.verifierName}.
            </Text>
            <Text style={styles.resultMono}>
              Signature: {handshake?.response?.signature?.slice(0, 20)}…
            </Text>
          </GlassCard>
        )}

        {/* Error */}
        {(step === 'error' || error) && (
          <GlassCard glowState="revoked" style={styles.resultCard}>
            <Text style={[styles.resultIcon, { color: colors.trust.revoked.solid }]}>✕</Text>
            <Text style={[styles.resultTitle, { color: colors.trust.revoked.solid }]}>
              Authentication Failed
            </Text>
            <Text style={styles.resultDetail}>{error}</Text>
          </GlassCard>
        )}

        {/* Action — MUST be an explicit user button press */}
        <View style={styles.actions}>
          {(step === 'challenge_parsed') && (
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

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg.base, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  scroll: { paddingHorizontal: spacing.xs },
  header: { marginBottom: spacing.xl },
  title:  { ...typography.title2, color: colors.text.primary },
  sub:    { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 3 },

  challengeCard: { marginBottom: spacing.xl },
  verifierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  verifierIcon: {
    width: 44, height: 44, borderRadius: radius.xl,
    backgroundColor: colors.glass.medium, borderWidth: 1, borderColor: colors.border.light,
    alignItems: 'center', justifyContent: 'center',
  },
  verifierEmoji: { fontSize: 22 },
  verifierBody:  { flex: 1 },
  verifierName:  { ...typography.headline, color: colors.text.primary },
  verifierDid:   { ...typography.mono, fontSize: 9, color: colors.text.quaternary, marginTop: 2 },

  scopeSection:  { marginBottom: spacing.sm },
  sectionLabel:  { ...typography.label, color: colors.text.quaternary, marginBottom: spacing.xxs },
  scopeChips:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs },
  scopeChip: {
    paddingHorizontal: spacing.xxs, paddingVertical: 3,
    backgroundColor: colors.brand.primaryDim, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.brand.primary + '40',
  },
  scopeChipText: { ...typography.caption, color: colors.brand.primary },

  expiryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxs },
  nonceRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  expiryLabel: { ...typography.caption, color: colors.text.quaternary },
  expiryValue: { ...typography.caption, color: colors.text.secondary },
  nonce:       { ...typography.mono, fontSize: 10, color: colors.text.tertiary },

  resultCard: { marginBottom: spacing.xl, alignItems: 'center', paddingVertical: spacing['5xl'] },
  resultIcon:  { fontSize: 36, marginBottom: spacing.xxs, color: colors.trust.verified.solid },
  resultTitle: { ...typography.title3, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.xxs },
  resultDetail:{ ...typography.bodySmall, color: colors.text.tertiary, textAlign: 'center' },
  resultMono:  { ...typography.mono, fontSize: 10, color: colors.text.quaternary, marginTop: spacing.xxs },

  actions: { gap: spacing.sm },
});

export default HandshakeScreen;