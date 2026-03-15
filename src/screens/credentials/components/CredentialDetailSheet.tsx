/**
 * CredentialDetailSheet
 *
 * Full-detail modal for a single credential.
 *
 * Progressive Trust Reveal (master prompt 3 spec):
 *   Tap 1 → Verification result  (trust badge + summary)
 *   Tap 2 → Verification details (individual check rows with ✓/✕/⚠)
 *   Tap 3 → Trust graph          (Issuer → Credential → Person chain)
 *
 * Other sections:
 *   • Apple Wallet-style hero pass (always visible)
 *   • Issuer section with trust badge
 *   • Cryptographic proof section
 *   • Actions: Verify Now · Share QR · Remove
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }                    from '../../../theme/colors';
import { radius }                    from '../../../theme/radius';
import { shadows }                   from '../../../theme/shadows';
import { spacing }                   from '../../../theme/spacing';
import { typography }                from '../../../theme/typography';
import { AppBadge }                  from '../../../components/common/AppBadge';
import { AppButton }                 from '../../../components/common/AppButton';
import { GlassCard }                 from '../../../components/common/GlassCard';
import { LoadingState }              from '../../../components/common/LoadingState';
import { CREDENTIAL_TYPE_META }      from '../../../models/credential';
import type { CredentialWithIssuer } from '../../../models/credential';
import type { VerificationResult }   from '../../../models/verification';
import type { TrustState }           from '../../../theme/colors';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CredentialDetailSheetProps {
  credential:  CredentialWithIssuer | null;
  visible:     boolean;
  onDismiss:   () => void;
  onVerify:    (id: string) => Promise<VerificationResult | null>;
  onShare:     (credential: CredentialWithIssuer) => void;
  onDelete:    (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CredentialDetailSheet: React.FC<CredentialDetailSheetProps> = ({
  credential,
  visible,
  onDismiss,
  onVerify,
  onShare,
  onDelete,
}) => {
  const [verifying,           setVerifying]           = useState(false);
  const [verificationResult,  setVerificationResult]  = useState<VerificationResult | null>(null);
  const [tapLayer,            setTapLayer]            = useState(0);
  const [showDeleteConfirm,   setShowDeleteConfirm]   = useState(false);

  // Reset state when a new credential opens
  useEffect(() => {
    if (visible) {
      setVerificationResult(null);
      setTapLayer(0);
      setVerifying(false);
      setShowDeleteConfirm(false);
    }
  }, [visible, credential?.id]);

  const resultFade = useRef(new Animated.Value(0)).current;

  const handleVerify = useCallback(async () => {
    if (!credential) return;
    setVerifying(true);
    setVerificationResult(null);
    setTapLayer(0);
    resultFade.setValue(0);
    const result = await onVerify(credential.id);
    setVerificationResult(result);
    setVerifying(false);
    if (result) {
      Animated.spring(resultFade, {
        toValue: 1, useNativeDriver: true, speed: 14, bounciness: 5,
      }).start();
    }
  }, [credential, onVerify, resultFade]);

  const handleDelete = useCallback(() => {
    if (!credential) return;
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    onDelete(credential.id);
    onDismiss();
  }, [credential, showDeleteConfirm, onDelete, onDismiss]);

  if (!credential) return null;

  const meta      = CREDENTIAL_TYPE_META[credential.type];
  const isExpired = credential.expiresAt
    ? new Date(credential.expiresAt) < new Date()
    : false;

  const displayTrustState = (verificationResult?.trustState ?? credential.trustState) as TrustState;
  const trustColor        = colors.trust[displayTrustState]?.solid ?? colors.brand.primary;

  const tapHint =
    !verificationResult ? null :
    tapLayer === 0 ? 'Tap card to see check details' :
    tapLayer === 1 ? 'Tap again to reveal trust graph' :
    'Tap to collapse';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>

        {/* ── Handle + header ───────────────────────────────────────────── */}
        <View style={styles.modalHeader}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Credential</Text>
            <View style={{ width: 52 }} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── 1. Apple Wallet hero pass — always visible ─────────────── */}
          <View style={[styles.passCard, { borderColor: meta.accentColor + '55' }]}>
            <View style={[styles.passStripe, { backgroundColor: meta.accentColor }]} />
            <View style={styles.passBody}>

              {/* Issuer row */}
              <View style={styles.issuerRow}>
                <View style={[styles.issuerBadge, { borderColor: meta.accentColor + '60' }]}>
                  <Text style={styles.issuerEmoji}>{credential.issuer.logoEmoji}</Text>
                </View>
                <View style={styles.issuerInfo}>
                  <Text style={styles.issuerName}>{credential.issuer.name}</Text>
                  <Text style={styles.issuerMeta}>
                    {credential.issuer.category} · {credential.issuer.country}
                  </Text>
                </View>
                <AppBadge
                  label={isExpired ? 'Expired' : credential.trustState}
                  variant={isExpired ? 'revoked' : credential.trustState as TrustState}
                  dot size="md"
                />
              </View>

              {/* Title + description */}
              <Text style={styles.credTitle}>{credential.title}</Text>
              <Text style={styles.credDesc} numberOfLines={2}>{credential.description}</Text>

              {/* Date bar */}
              <View style={styles.dateBar}>
                <DateCell label="ISSUED"  value={fmtDate(credential.issuedAt)} />
                <View style={styles.dateSep} />
                <DateCell
                  label="EXPIRES"
                  value={credential.expiresAt ? fmtDate(credential.expiresAt) : 'No expiry'}
                  warn={isExpired}
                />
              </View>

              {/* Algo badge */}
              <View style={styles.algoBadge}>
                <Text style={styles.algoText}>🔐  {credential.signatureAlgorithm}</Text>
              </View>
            </View>
          </View>

          {/* ── 2. Progressive Trust Reveal (3-layer GlassCard) ──────────── */}
          <SectionLabel text="TRUST VERIFICATION" />

          {verifying ? (
            <LoadingState message="Running trust checks…" />
          ) : (
            <GlassCard
              glowState={verificationResult ? displayTrustState : 'none'}
              animateGlow={!!verificationResult}
              revealLayers={verificationResult ? 3 : 1}
              onTapLayer={verificationResult ? setTapLayer : undefined}
              padding="md"
              style={styles.trustCard}
            >
              {/* ── No result yet placeholder ──────────────────────────── */}
              {!verificationResult ? (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderIcon}>◎</Text>
                  <Text style={styles.placeholderText}>
                    Tap "Verify Now" to run live trust checks
                  </Text>
                </View>
              ) : (
                <Animated.View style={{ opacity: resultFade }}>

                  {/* Layer 0 — Result summary */}
                  <View style={styles.resultHeader}>
                    <AppBadge
                      label={verificationResult.trustState}
                      variant={verificationResult.trustState as TrustState}
                      dot size="lg"
                    />
                    <Text style={styles.resultDuration}>{verificationResult.durationMs}ms</Text>
                  </View>
                  <Text style={[styles.resultSummary, { color: trustColor }]}>
                    {verificationResult.summary}
                  </Text>

                  {/* Layer 1 — Check rows (revealed on second tap) */}
                  {tapLayer >= 1 && (
                    <View style={styles.checksSection}>
                      <LayerDivider label="VERIFICATION DETAILS" />
                      {verificationResult.checks.map(c => (
                        <CheckRow key={c.id} check={c} />
                      ))}
                    </View>
                  )}

                  {/* Layer 2 — Trust graph (revealed on third tap) */}
                  {tapLayer >= 2 && (
                    <View style={styles.graphSection}>
                      <LayerDivider label="TRUST GRAPH" />
                      <TrustGraph
                        nodes={[credential.issuer.shortName, meta.label, 'You']}
                        color={trustColor}
                      />
                    </View>
                  )}

                  {tapHint && <Text style={styles.tapHint}>{tapHint}</Text>}
                </Animated.View>
              )}
            </GlassCard>
          )}

          {/* ── 3. Issuer section ─────────────────────────────────────────── */}
          <SectionLabel text="ISSUER" />
          <GlassCard
            glowState={credential.issuer.isVerified ? 'trusted' : 'suspicious'}
            padding="md"
            style={styles.sectionCard}
          >
            <View style={styles.issuerDetailTop}>
              <View style={[styles.issuerDetailBadge, { borderColor: meta.accentColor + '50' }]}>
                <Text style={{ fontSize: 20 }}>{credential.issuer.logoEmoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.issuerDetailName}>{credential.issuer.name}</Text>
                <Text style={styles.issuerDetailMeta}>
                  {credential.issuer.category} · {credential.issuer.country}
                </Text>
              </View>
              <AppBadge
                label={credential.issuer.isVerified ? 'Verified' : 'Unverified'}
                variant={credential.issuer.isVerified ? 'verified' : 'suspicious'}
                size="sm"
              />
            </View>
            <DetailRow label="DID"        value={credential.issuerDid}          mono truncate />
            <DetailRow label="Trust"      value={credential.issuer.trustState} />
          </GlassCard>

          {/* ── 4. Cryptographic proof section ───────────────────────────── */}
          <SectionLabel text="CRYPTOGRAPHIC PROOF" />
          <GlassCard padding="md" style={styles.sectionCard}>
            <DetailRow label="Algorithm"  value={credential.signatureAlgorithm} />
            <DetailRow label="Proof hash" value={credential.proofHash}          mono truncate />
            <DetailRow
              label="Signature"
              value={credential.isVerified ? '✓ Valid' : '✕ Not verified'}
            />
            <DetailRow label="Issued"     value={fmtDate(credential.issuedAt)} />
            {credential.expiresAt && (
              <DetailRow
                label="Expires"
                value={fmtDate(credential.expiresAt)}
                warn={isExpired}
              />
            )}
          </GlassCard>

          {/* ── 5. Actions ────────────────────────────────────────────────── */}
          <View style={styles.actions}>
            <AppButton
              label={verifying ? 'Verifying…' : 'Verify Now'}
              onPress={handleVerify}
              loading={verifying}
              variant="primary"
              fullWidth
            />
            <AppButton
              label="Share QR"
              onPress={() => onShare(credential)}
              variant="secondary"
              fullWidth
            />
            <AppButton
              label={showDeleteConfirm ? 'Tap again to confirm' : 'Remove from wallet'}
              onPress={handleDelete}
              variant="danger"
              fullWidth
            />
          </View>

          <View style={{ height: spacing[10] }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─── Trust graph ──────────────────────────────────────────────────────────────

const TrustGraph: React.FC<{ nodes: string[]; color: string }> = ({ nodes, color }) => (
  <View style={graphStyles.row}>
    {nodes.map((node, i) => (
      <React.Fragment key={node}>
        <View style={[graphStyles.node, { borderColor: color + '80' }]}>
          <Text style={[graphStyles.nodeLabel, { color }]}>{node}</Text>
        </View>
        {i < nodes.length - 1 && (
          <View style={graphStyles.arrowWrap}>
            <View style={[graphStyles.line, { backgroundColor: color + '40' }]} />
            <Text style={[graphStyles.arrowText, { color }]}>›</Text>
          </View>
        )}
      </React.Fragment>
    ))}
  </View>
);

const graphStyles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing[1] },
  node:      {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1] + 2,
    borderRadius: radius.full, borderWidth: 1.5, backgroundColor: colors.glass.medium,
  },
  nodeLabel: { ...typography.buttonXs, fontWeight: '700' },
  arrowWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  line:      { height: 1.5, width: 10 },
  arrowText: { ...typography.title3, lineHeight: 18, fontWeight: '300' },
});

// ─── Layer divider ────────────────────────────────────────────────────────────

const LayerDivider: React.FC<{ label: string }> = ({ label }) => (
  <>
    <View style={dividerStyles.line} />
    <Text style={dividerStyles.label}>{label}</Text>
  </>
);
const dividerStyles = StyleSheet.create({
  line:  { height: 1, backgroundColor: colors.border.subtle, marginBottom: spacing[2] },
  label: { ...typography.label, color: colors.text.quaternary, marginBottom: spacing[2] },
});

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text style={labelStyle.t}>{text}</Text>
);
const labelStyle = StyleSheet.create({
  t: {
    ...typography.label,
    color: colors.text.quaternary,
    marginBottom: spacing[2],
    marginTop: spacing[3],
    paddingHorizontal: spacing[1],
  },
});

// ─── DateCell ─────────────────────────────────────────────────────────────────

const DateCell: React.FC<{ label: string; value: string; warn?: boolean }> = ({
  label, value, warn,
}) => (
  <View style={dateStyles.cell}>
    <Text style={dateStyles.label}>{label}</Text>
    <Text style={[dateStyles.value, warn && { color: colors.trust.revoked.solid }]}>
      {value}
    </Text>
  </View>
);
const dateStyles = StyleSheet.create({
  cell:  { flex: 1, alignItems: 'center' },
  label: { ...typography.label, fontSize: 8, color: colors.text.quaternary, marginBottom: 2 },
  value: { ...typography.caption, color: colors.text.secondary },
});

// ─── CheckRow ─────────────────────────────────────────────────────────────────

const CheckRow: React.FC<{
  check: { label: string; outcome: string; detail?: string };
}> = ({ check }) => {
  const color =
    check.outcome === 'pass' ? colors.trust.verified.solid   :
    check.outcome === 'fail' ? colors.trust.revoked.solid    :
    check.outcome === 'warn' ? colors.trust.suspicious.solid :
    colors.text.quaternary;
  const icon =
    check.outcome === 'pass' ? '✓' :
    check.outcome === 'fail' ? '✕' :
    check.outcome === 'warn' ? '⚠' : '○';
  return (
    <View style={checkStyles.row}>
      <Text style={[checkStyles.icon, { color }]}>{icon}</Text>
      <View style={checkStyles.body}>
        <Text style={checkStyles.label}>{check.label}</Text>
        {check.detail && <Text style={checkStyles.detail}>{check.detail}</Text>}
      </View>
    </View>
  );
};
const checkStyles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], marginBottom: spacing[2] },
  icon:   { ...typography.body, fontWeight: '700', width: 16, flexShrink: 0 },
  body:   { flex: 1 },
  label:  { ...typography.bodySm, color: colors.text.secondary },
  detail: { ...typography.captionSm, color: colors.text.quaternary, marginTop: 1 },
});

// ─── DetailRow ────────────────────────────────────────────────────────────────

const DetailRow: React.FC<{
  label: string; value: string; mono?: boolean; truncate?: boolean; warn?: boolean;
}> = ({ label, value, mono, truncate, warn }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text
      style={[rowStyles.value, mono && rowStyles.mono, warn && { color: colors.trust.revoked.solid }]}
      numberOfLines={truncate ? 1 : undefined}
    >
      {value}
    </Text>
  </View>
);
const rowStyles = StyleSheet.create({
  row:   {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing[2],
  },
  label: { ...typography.captionSm, color: colors.text.quaternary, flex: 0.42 },
  value: { ...typography.captionSm, color: colors.text.secondary,  flex: 0.58, textAlign: 'right' },
  mono:  { ...typography.mono, fontSize: 10 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.bg.base },

  // Header
  modalHeader: {
    paddingTop:     Platform.OS === 'ios' ? spacing[2] : spacing[3],
    paddingBottom:  spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.hairline,
    alignItems:     'center',
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border.medium, marginBottom: spacing[3],
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: spacing[5], paddingBottom: spacing[2],
  },
  closeBtn:   { width: 52 },
  closeText:  { ...typography.body, color: colors.brand.primary },
  modalTitle: { ...typography.headline, color: colors.text.primary },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing[4], paddingTop: spacing[4] },

  // Apple Wallet pass card
  passCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius:    radius['3xl'],
    borderWidth:     1.5,
    overflow:        'hidden',
    marginBottom:    spacing[4],
    ...shadows.glowTrusted,
  },
  passStripe:  { height: 5 },
  passBody:    { padding: spacing[4] },

  issuerRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing[3], marginBottom: spacing[3],
  },
  issuerBadge: {
    width: 44, height: 44, borderRadius: radius.xl, borderWidth: 1,
    backgroundColor: colors.glass.medium, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  issuerEmoji:  { fontSize: 22 },
  issuerInfo:   { flex: 1 },
  issuerName:   { ...typography.headline, color: colors.text.primary },
  issuerMeta:   { ...typography.captionSm, color: colors.text.tertiary, marginTop: 1 },

  credTitle: { ...typography.title2, color: colors.text.primary, marginBottom: spacing[1] },
  credDesc:  { ...typography.bodySm, color: colors.text.secondary, marginBottom: spacing[3] },

  dateBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.glass.subtle, borderRadius: radius.xl,
    padding: spacing[3], marginBottom: spacing[3],
  },
  dateSep: {
    width: 1, height: 28, backgroundColor: colors.border.subtle,
    marginHorizontal: spacing[3],
  },

  algoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.glass.medium, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border.subtle,
    paddingHorizontal: spacing[3], paddingVertical: spacing[1] + 1,
  },
  algoText: { ...typography.captionSm, color: colors.text.tertiary },

  // Progressive Trust Reveal card
  trustCard:   { marginBottom: spacing[2] },
  placeholder: { alignItems: 'center', paddingVertical: spacing[5], gap: spacing[2] },
  placeholderIcon: { fontSize: 32, color: colors.text.quaternary },
  placeholderText: { ...typography.bodySm, color: colors.text.quaternary, textAlign: 'center' },

  resultHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing[2],
  },
  resultDuration: { ...typography.captionSm, color: colors.text.quaternary },
  resultSummary:  { ...typography.body, fontWeight: '600', marginBottom: spacing[1] },

  checksSection: { marginTop: spacing[2] },
  graphSection:  { marginTop: spacing[2] },
  tapHint:       {
    ...typography.captionSm, color: colors.text.quaternary,
    textAlign: 'right', marginTop: spacing[3],
  },

  // Issuer & proof sections
  sectionCard: { marginBottom: spacing[2] },
  issuerDetailTop: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing[3], marginBottom: spacing[3],
  },
  issuerDetailBadge: {
    width: 40, height: 40, borderRadius: radius.lg, borderWidth: 1,
    backgroundColor: colors.glass.medium, alignItems: 'center', justifyContent: 'center',
  },
  issuerDetailName: { ...typography.headlineSm, color: colors.text.primary },
  issuerDetailMeta: { ...typography.captionSm,  color: colors.text.tertiary, marginTop: 1 },

  // Actions
  actions: { gap: spacing[3], marginTop: spacing[2] },
});
