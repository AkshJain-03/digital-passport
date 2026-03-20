/**
 * ProductDetailScreen
 *
 * Full product authenticity view:
 *   • Hero card: product name + brand + serial + status badge
 *   • Trust glow ring
 *   • Verification check results (after scan or Verify tap)
 *   • Custody chain timeline
 *   • Fraud signal list
 *
 * Receives productId or serialNumber via navigation params.
 */

import React, { useCallback, useEffect } from 'react';
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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { colors }                  from '../../theme/colors';
import { radius }                  from '../../theme/radius';
import { spacing }                 from '../../theme/spacing';
import { typography }              from '../../theme/typography';
import { GlassCard }               from '../../components/common/GlassCard';
import { AppBadge }                from '../../components/common/AppBadge';
import { AppButton }               from '../../components/common/AppButton';
import { AppSectionTitle }         from '../../components/common/AppSectionTitle';
import { LoadingState }            from '../../components/common/LoadingState';
import { EmptyState }              from '../../components/common/EmptyState';
import { LiquidBackButton }        from '../../components/common/LiquidBackButton';
import { useProductVerification }  from '../../hooks/useProductVerification';
import { fraudSignalService }      from '../../services/ai/fraudSignalService';
import { formatDate, formatRelative } from '../../utils/formatters';
import type { RootStackParamList } from '../../app/routes';
import type { TrustState }         from '../../theme/colors';
import type { CustodyCheckpoint }  from '../../models/product';

type RouteProps = RouteProp<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC = () => {
  const nav   = useNavigation();
  const route = useRoute<RouteProps>();
  const { productId } = route.params;

  const { product, result, isLoading, error, verify } = useProductVerification();
  const resultFade = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    verify(productId);
  }, [productId]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (result) {
      Animated.spring(resultFade, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 4 }).start();
    }
  }, [result, resultFade]);

  const fraudAnalysis = product ? fraudSignalService.analyseProduct(product) : null;
  const trustColor    = result
    ? colors.trust[result.trustState as TrustState]?.solid ?? colors.brand.primary
    : colors.brand.primary;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <LiquidBackButton onPress={() => nav.goBack()} />
        <Text style={styles.title}>Product Detail</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <LoadingState message="Verifying product…" />
      ) : error ? (
        <EmptyState icon="⚠" title="Verification failed" description={error} glowState="suspicious" />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Hero card ─────────────────────────────────────────────── */}
          {product && (
            <GlassCard
              glowState={(result?.trustState ?? 'unknown') as TrustState}
              animateGlow
              padding="md"
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroIcon}>⬡</Text>
                </View>
                <View style={styles.heroBody}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                </View>
                {result && (
                  <AppBadge
                    label={result.trustState}
                    variant={result.trustState as TrustState}
                    dot size="md"
                  />
                )}
              </View>

              <View style={styles.metaGrid}>
                <MetaCell label="Serial"   value={product.serialNumber} mono />
                <MetaCell label="Category" value={product.category} />
                <MetaCell label="Made"     value={formatDate(product.manufacturedAt)} />
                <MetaCell label="Status"   value={product.status} />
              </View>

              {result && (
                <Text style={[styles.summary, { color: trustColor }]}>{result.summary}</Text>
              )}
            </GlassCard>
          )}

          {/* ── Verification checks ────────────────────────────────────── */}
          {result && (
            <Animated.View style={{ opacity: resultFade }}>
              <AppSectionTitle title="Verification Checks" spacing="normal" style={styles.sectionTitle} />
              <GlassCard padding="md" style={styles.checksCard}>
                {result.checks.map(check => (
                  <View key={check.id} style={styles.checkRow}>
                    <Text style={[styles.checkIcon, {
                      color: check.outcome === 'pass' ? colors.trust.verified.solid :
                             check.outcome === 'fail' ? colors.trust.revoked.solid  :
                             colors.trust.suspicious.solid,
                    }]}>
                      {check.outcome === 'pass' ? '✓' : check.outcome === 'fail' ? '✕' : '⚠'}
                    </Text>
                    <View style={styles.checkBody}>
                      <Text style={styles.checkLabel}>{check.label}</Text>
                      {check.detail && <Text style={styles.checkDetail}>{check.detail}</Text>}
                    </View>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* ── Custody chain ──────────────────────────────────────────── */}
          {product && product.custodyChain.length > 0 && (
            <>
              <AppSectionTitle
                title="Chain of Custody"
                count={product.custodyChain.length}
                spacing="normal"
                style={styles.sectionTitle}
              />
              <View style={styles.timeline}>
                {[...product.custodyChain]
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((cp, i, arr) => (
                    <CustodyRow
                      key={cp.id}
                      checkpoint={cp}
                      isLast={i === arr.length - 1}
                      trustColor={trustColor}
                    />
                  ))}
              </View>
            </>
          )}

          {/* ── Fraud signals ──────────────────────────────────────────── */}
          {fraudAnalysis && fraudAnalysis.signals.length > 0 && (
            <>
              <AppSectionTitle title="Risk Signals" spacing="normal" style={styles.sectionTitle} />
              <GlassCard
                glowState={fraudAnalysis.trustState as TrustState}
                padding="md"
                style={styles.checksCard}
              >
                <View style={styles.riskScoreRow}>
                  <Text style={styles.riskScoreLabel}>Risk Score</Text>
                  <Text style={[styles.riskScoreValue, {
                    color: fraudAnalysis.riskScore >= 50 ? colors.trust.suspicious.solid :
                           fraudAnalysis.riskScore >= 20 ? colors.trust.pending.solid    :
                           colors.trust.verified.solid,
                  }]}>
                    {fraudAnalysis.riskScore}/100
                  </Text>
                </View>
                {fraudAnalysis.signals.map(signal => (
                  <View key={signal.id} style={styles.checkRow}>
                    <Text style={[styles.checkIcon, {
                      color: signal.severity === 'high'   ? colors.trust.revoked.solid     :
                             signal.severity === 'medium' ? colors.trust.suspicious.solid  :
                             colors.trust.pending.solid,
                    }]}>
                      {signal.severity === 'high' ? '✕' : '⚠'}
                    </Text>
                    <View style={styles.checkBody}>
                      <Text style={styles.checkLabel}>{signal.label}</Text>
                      {signal.detail && <Text style={styles.checkDetail}>{signal.detail}</Text>}
                    </View>
                  </View>
                ))}
              </GlassCard>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
};

// ─── Custody row ──────────────────────────────────────────────────────────────

const CustodyRow: React.FC<{
  checkpoint: CustodyCheckpoint;
  isLast:     boolean;
  trustColor: string;
}> = ({ checkpoint, isLast, trustColor }) => (
  <View style={custodyStyles.row}>
    {/* Timeline spine */}
    <View style={custodyStyles.spineWrap}>
      <View style={[custodyStyles.dot, { backgroundColor: trustColor }]} />
      {!isLast && <View style={custodyStyles.line} />}
    </View>
    <GlassCard padding="md" style={custodyStyles.card}>
      <Text style={custodyStyles.location}>{checkpoint.location}</Text>
      <Text style={custodyStyles.actor}  numberOfLines={1}>{checkpoint.actor}</Text>
      {checkpoint.note && <Text style={custodyStyles.note}>{checkpoint.note}</Text>}
      <Text style={custodyStyles.time}>{formatRelative(checkpoint.timestamp)}</Text>
    </GlassCard>
  </View>
);

const custodyStyles = StyleSheet.create({
  row:      { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[2] },
  spineWrap:{ alignItems: 'center', width: 16, paddingTop: spacing[3] },
  dot:      { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  line:     { width: 2, flex: 1, backgroundColor: colors.border.subtle, marginTop: 4 },
  card:     { flex: 1 },
  location: { ...typography.headlineSm, color: colors.text.primary, marginBottom: 2 },
  actor:    { ...typography.mono,       fontSize: 10, color: colors.text.quaternary },
  note:     { ...typography.captionSm,  color: colors.text.tertiary, marginTop: 3 },
  time:     { ...typography.captionSm,  color: colors.text.quaternary, marginTop: spacing[2] },
});

// ─── Meta cell ────────────────────────────────────────────────────────────────

const MetaCell: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label, value, mono,
}) => (
  <View style={metaStyles.cell}>
    <Text style={metaStyles.label}>{label}</Text>
    <Text style={[metaStyles.value, mono && metaStyles.mono]} numberOfLines={1}>{value}</Text>
  </View>
);

const metaStyles = StyleSheet.create({
  cell:  { flex: 1, minWidth: '45%' },
  label: { ...typography.label,    color: colors.text.quaternary, marginBottom: 3 },
  value: { ...typography.bodySm,   color: colors.text.secondary },
  mono:  { ...typography.mono,     fontSize: 10, color: colors.text.tertiary },
});

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: 'transparent', paddingTop: Platform.OS === 'ios' ? 66 : 46 },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing[4],
    marginBottom:      spacing[4],
  },
  title:       { ...typography.headline, color: colors.text.primary },
  scroll:      { paddingHorizontal: spacing[4] },
  heroCard:    { marginBottom: spacing[4] },
  heroTop: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[3],
    marginBottom:   spacing[3],
  },
  heroLeft: {
    width:           48,
    height:          48,
    borderRadius:    radius.xl,
    backgroundColor: colors.glass.medium,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     colors.border.light,
  },
  heroIcon:     { fontSize: 24 },
  heroBody:     { flex: 1 },
  productName:  { ...typography.title3,    color: colors.text.primary },
  productBrand: { ...typography.bodySm,    color: colors.text.tertiary, marginTop: 2 },
  metaGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[3],
    marginBottom:  spacing[3],
  },
  summary:      { ...typography.bodySm,    fontWeight: '600' },
  sectionTitle: { paddingHorizontal: 0, marginTop: spacing[2], marginBottom: spacing[2] },
  checksCard:   { marginBottom: spacing[4] },
  checkRow:     { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[2], alignItems: 'flex-start' },
  checkIcon:    { ...typography.body, fontWeight: '700', width: 16, flexShrink: 0 },
  checkBody:    { flex: 1 },
  checkLabel:   { ...typography.bodySm, color: colors.text.secondary },
  checkDetail:  { ...typography.captionSm, color: colors.text.quaternary, marginTop: 2 },
  timeline:     { paddingHorizontal: 0, marginBottom: spacing[4] },
  riskScoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] },
  riskScoreLabel: { ...typography.body,  color: colors.text.tertiary },
  riskScoreValue: { ...typography.title3, fontWeight: '700' },
});

export default ProductDetailScreen;