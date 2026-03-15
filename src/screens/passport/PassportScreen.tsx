import React, { useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, type TrustState } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { GlassCard } from '../../components/common/GlassCard';
import { AppBadge } from '../../components/common/AppBadge';
import { AppSectionTitle } from '../../components/common/AppSectionTitle';

interface Credential {
  id: string;
  type: string;
  title: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  trustState: TrustState;
  did: string;
}

const MOCK_CREDENTIALS: Credential[] = [
  {
    id: '1',
    type: 'Education',
    title: 'Bachelor of Technology',
    issuer: 'IIT Bombay',
    issuedAt: '2022-05-14',
    trustState: 'verified',
    did: 'did:sov:7Tq3kT…9fP2',
  },
  {
    id: '2',
    type: 'Identity',
    title: 'Aadhaar KYC',
    issuer: 'UIDAI',
    issuedAt: '2023-01-09',
    expiresAt: '2033-01-09',
    trustState: 'trusted',
    did: 'did:sov:7Tq3kT…9fP2',
  },
  {
    id: '3',
    type: 'Professional',
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    issuedAt: '2023-08-22',
    expiresAt: '2026-08-22',
    trustState: 'verified',
    did: 'did:sov:7Tq3kT…9fP2',
  },
  {
    id: '4',
    type: 'Membership',
    title: 'ACM Member',
    issuer: 'Association for Computing Machinery',
    issuedAt: '2024-01-01',
    expiresAt: '2025-01-01',
    trustState: 'pending',
    did: 'did:sov:7Tq3kT…9fP2',
  },
];

const TAP_LAYER_CONTENT = [
  (c: Credential) => (
    <View>
      <Text style={styles.layerLabel}>ISSUER</Text>
      <Text style={styles.layerValue}>{c.issuer}</Text>
      <Text style={[styles.layerLabel, { marginTop: spacing.sm }]}>TYPE</Text>
      <Text style={styles.layerValue}>{c.type}</Text>
    </View>
  ),
  (c: Credential) => (
    <View>
      <Text style={styles.layerLabel}>ISSUED</Text>
      <Text style={styles.layerValue}>{c.issuedAt}</Text>
      {c.expiresAt ? (
        <>
          <Text style={[styles.layerLabel, { marginTop: spacing.sm }]}>EXPIRES</Text>
          <Text style={styles.layerValue}>{c.expiresAt}</Text>
        </>
      ) : null}
      <Text style={[styles.layerLabel, { marginTop: spacing.sm }]}>DID</Text>
      <Text style={styles.didText}>{c.did}</Text>
    </View>
  ),
  (c: Credential) => (
    <View>
      <Text style={styles.layerLabel}>TRUST GRAPH</Text>
      <View style={styles.trustGraph}>
        <TrustNode label={c.issuer} color={colors.trust.trusted.solid} />
        <Text style={styles.arrow}>→</Text>
        <TrustNode label={c.type} color={colors.brand.primary} />
        <Text style={styles.arrow}>→</Text>
        <TrustNode label="You" color={colors.trust.verified.solid} />
      </View>
    </View>
  ),
];

const TrustNode: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <View style={[styles.trustNode, { borderColor: color }]}>
    <Text style={[styles.trustNodeText, { color }]} numberOfLines={1}>{label}</Text>
  </View>
);

const CredentialCard: React.FC<{ credential: Credential }> = ({ credential }) => {
  const [tapLayer, setTapLayer] = useState(0);

  return (
    <GlassCard
      glowState={credential.trustState}
      revealLayers={3}
      onTapLayer={setTapLayer}
      style={styles.credCard}
    >
      {/* Header row */}
      <View style={styles.credHeader}>
        <View style={styles.typeIcon}>
          <Text style={styles.typeIconText}>
            {credential.type === 'Education'
              ? '◈'
              : credential.type === 'Identity'
              ? '◎'
              : credential.type === 'Professional'
              ? '✦'
              : '◌'}
          </Text>
        </View>
        <View style={styles.credInfo}>
          <Text style={styles.credTitle}>{credential.title}</Text>
          <Text style={styles.credIssuer}>{credential.issuer}</Text>
        </View>
        <AppBadge label={credential.trustState} variant={credential.trustState} />
      </View>

      {/* Reveal layers */}
      {tapLayer >= 1 && (
        <View style={styles.layerContent}>
          <View style={styles.layerDivider} />
          {TAP_LAYER_CONTENT[tapLayer - 1]?.(credential)}
        </View>
      )}

      {/* Tap hint */}
      {tapLayer < 3 && (
        <Text style={styles.tapHint}>
          {tapLayer === 0
            ? 'Tap to see details'
            : tapLayer === 1
            ? 'Tap again for dates'
            : 'Tap for trust graph'}
        </Text>
      )}
    </GlassCard>
  );
};

export const PassportScreen: React.FC = () => {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.base} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Passport</Text>
        <Text style={styles.headerSub}>Your verifiable credentials</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppSectionTitle
          title={`${MOCK_CREDENTIALS.length} Credentials`}
          actionLabel="+ Add"
          onAction={() => {}}
          style={styles.sectionTitle}
        />

        {MOCK_CREDENTIALS.map(cred => (
          <CredentialCard key={cred.id} credential={cred} />
        ))}

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.text.primary,
  },
  headerSub: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: 0,
  },
  credCard: {},
  credHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.glass.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typeIconText: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  credInfo: {
    flex: 1,
  },
  credTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  credIssuer: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  layerContent: {
    marginTop: spacing.sm,
  },
  layerDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  layerLabel: {
    ...typography.label,
    color: colors.text.quaternary,
    marginBottom: 3,
  },
  layerValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  didText: {
    ...typography.mono,
    color: colors.text.tertiary,
  },
  trustGraph: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  trustNode: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: 100,
  },
  trustNodeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  arrow: {
    ...typography.caption,
    color: colors.text.quaternary,
  },
  tapHint: {
    ...typography.caption,
    color: colors.text.quaternary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default PassportScreen;