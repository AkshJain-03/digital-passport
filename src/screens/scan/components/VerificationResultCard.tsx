/**
 * VerificationResultCard
 *
 * 3-layer progressive trust reveal card:
 *   Layer 0 — Trust badge + summary + stat chips + duration
 *   Layer 1 — Full check rows with coloured dots and detail lines
 *   Layer 2 — Trust chain graph (Issuer → Type → You) + verified timestamp
 *
 * Upgrades:
 *  • Animated header icon slides in with spring
 *  • Trust colour used as card accent stripe at top
 *  • Stat chips have coloured fills
 *  • Check rows: dividers between them, detail lines indented
 *  • Trust chain nodes pulse with trust colour shadow
 *  • Layer transitions: each layer fades/slides up individually
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }    from '../../../theme/colors';
import { radius }    from '../../../theme/radius';
import { GlassCard } from '../../../components/common/GlassCard';
import { AppBadge }  from '../../../components/common/AppBadge';
import type { VerificationResult } from '../../../domain/verification/verificationTypes';
import type { TrustState }         from '../../../theme/colors';
import { SCAN_TYPE_META }           from '../../../domain/verification/verificationTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  title3:   t.title3    ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.bodySm    ?? t.body      ?? {},
  caption:  t.captionSm ?? t.caption   ?? {},
  label:    t.label     ?? {},
  button:   t.buttonXs  ?? t.button    ?? {},
  mono:     t.mono      ?? {},
};

interface VerificationResultCardProps {
  result:     VerificationResult;
  fadeAnim:   Animated.Value;
  tapLayer:   number;
  onTapLayer: (layer: number) => void;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  result,
  fadeAnim,
  tapLayer,
  onTapLayer,
}) => {
  const iconScale    = useRef(new Animated.Value(0.4)).current;
  const layer1Anim   = useRef(new Animated.Value(0)).current;
  const layer2Anim   = useRef(new Animated.Value(0)).current;

  const meta        = SCAN_TYPE_META[result.subjectType];
  const trustColor  = colors.trust[result.trustState as TrustState]?.solid ?? colors.brand.primary;
  const passCount   = result.checks.filter(c => c.outcome === 'pass').length;
  const failCount   = result.checks.filter(c => c.outcome === 'fail').length;
  const warnCount   = result.checks.filter(c => c.outcome === 'warn').length;

  // Icon entry spring
  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: 1, speed: 14, bounciness: 9, useNativeDriver: true,
    }).start();
  }, [iconScale]);

  // Layer reveal animations
  useEffect(() => {
    if (tapLayer >= 1) {
      Animated.spring(layer1Anim, {
        toValue: 1, speed: 16, bounciness: 4, useNativeDriver: true,
      }).start();
    }
  }, [tapLayer, layer1Anim]);

  useEffect(() => {
    if (tapLayer >= 2) {
      Animated.spring(layer2Anim, {
        toValue: 1, speed: 16, bounciness: 4, useNativeDriver: true,
      }).start();
    }
  }, [tapLayer, layer2Anim]);

  const trustNodes = [
    { label: `${meta.emoji} ${meta.label}`, sub: result.subjectType },
    {
      label: result.subjectId.length > 18
        ? `${result.subjectId.slice(0, 16)}…`
        : result.subjectId,
      sub: 'subject id',
    },
    { label: '🙋 You', sub: 'holder' },
  ];

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <GlassCard
        glowState={result.trustState as TrustState}
        animateGlow
        revealLayers={3}
        onTapLayer={onTapLayer}
        padding="none"
        style={styles.card}
      >
        {/* ── Top accent stripe ───────────────────────────────────────── */}
        <View style={[styles.stripe, { backgroundColor: trustColor }]} />

        <View style={styles.inner}>
          {/* ── Header ──────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.iconWrap,
                {
                  borderColor:     `${trustColor}60`,
                  backgroundColor: `${trustColor}14`,
                  transform:       [{ scale: iconScale }],
                  shadowColor:     trustColor,
                },
              ]}
            >
              <Text style={styles.iconEmoji}>{meta.emoji}</Text>
            </Animated.View>

            <View style={styles.headerBody}>
              <Text style={styles.typeLabel}>{meta.label.toUpperCase()}</Text>
              <Text style={styles.subjectId} numberOfLines={1}>
                {result.subjectId.length > 24
                  ? `${result.subjectId.slice(0, 22)}…`
                  : result.subjectId}
              </Text>
            </View>

            <AppBadge
              label={result.trustState}
              variant={result.trustState as TrustState}
              dot
              size="md"
            />
          </View>

          {/* ── Summary ─────────────────────────────────────────────── */}
          <Text style={styles.summary}>{result.summary}</Text>

          {/* ── Stat chips row ──────────────────────────────────────── */}
          <View style={styles.statRow}>
            <StatChip count={passCount} label="Passed"   color={colors.trust.verified.solid}   />
            {warnCount > 0 && (
              <StatChip count={warnCount} label="Caution" color={colors.trust.suspicious.solid} />
            )}
            {failCount > 0 && (
              <StatChip count={failCount} label="Failed"  color={colors.trust.revoked.solid}    />
            )}
            <View style={styles.durationChip}>
              <Text style={styles.durationText}>{result.durationMs}ms</Text>
            </View>
          </View>

          {/* ── Layer 1: check rows ──────────────────────────────────── */}
          {tapLayer >= 1 && (
            <Animated.View
              style={[
                styles.layer,
                {
                  opacity:   layer1Anim,
                  transform: [{
                    translateY: layer1Anim.interpolate({
                      inputRange: [0, 1], outputRange: [10, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={[styles.layerDivider, { backgroundColor: `${trustColor}30` }]} />
              <Text style={styles.layerLabel}>VERIFICATION CHECKS</Text>

              {result.checks.map((check, i) => {
                const isPass = check.outcome === 'pass';
                const isFail = check.outcome === 'fail';
                const cc = isPass ? colors.trust.verified.solid
                         : isFail ? colors.trust.revoked.solid
                         : colors.trust.suspicious.solid;
                return (
                  <View
                    key={check.id}
                    style={[
                      styles.checkRow,
                      i > 0 && { borderTopWidth: 1, borderTopColor: colors.border.hairline },
                    ]}
                  >
                    <View style={[styles.checkDot, { borderColor: cc, backgroundColor: `${cc}18` }]}>
                      <Text style={[styles.checkIcon, { color: cc }]}>
                        {isPass ? '✓' : isFail ? '✕' : '⚠'}
                      </Text>
                    </View>
                    <View style={styles.checkContent}>
                      <Text style={[styles.checkLabel, !isPass && { color: colors.text.primary }]}>
                        {check.label}
                      </Text>
                      {check.detail ? (
                        <Text style={styles.checkDetail} numberOfLines={1}>{check.detail}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          )}

          {/* ── Layer 2: trust graph ─────────────────────────────────── */}
          {tapLayer >= 2 && (
            <Animated.View
              style={[
                styles.layer,
                {
                  opacity:   layer2Anim,
                  transform: [{
                    translateY: layer2Anim.interpolate({
                      inputRange: [0, 1], outputRange: [10, 0],
                    }),
                  }],
                },
              ]}
            >
              <View style={[styles.layerDivider, { backgroundColor: `${trustColor}30` }]} />
              <Text style={styles.layerLabel}>TRUST CHAIN</Text>

              <View style={styles.trustChain}>
                {trustNodes.map((node, i) => (
                  <React.Fragment key={`trust-node-${i}`}>
                    <View style={[styles.trustNode, { borderColor: `${trustColor}60`, shadowColor: trustColor }]}>
                      <Text style={[styles.trustNodeLabel, { color: trustColor }]}>{node.label}</Text>
                      <Text style={styles.trustNodeSub}>{node.sub}</Text>
                    </View>
                    {i < trustNodes.length - 1 && (
                      <Text style={[styles.arrow, { color: trustColor }]}>→</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.timestampRow}>
                <Text style={styles.timestampLabel}>Verified at</Text>
                <Text style={styles.timestampValue}>
                  {new Date(result.verifiedAt).toLocaleTimeString()}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Tap hint ────────────────────────────────────────────── */}
          <Text style={styles.tapHint}>
            {tapLayer === 0 ? '↓  Tap card for check details'
              : tapLayer === 1 ? '↓  Tap again for trust chain'
              : '↑  Tap to collapse'}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ── StatChip ──────────────────────────────────────────────────────────────────

const StatChip: React.FC<{ count: number; label: string; color: string }> = ({
  count, label, color,
}) => (
  <View style={[styles.statChip, { borderColor: `${color}45`, backgroundColor: `${color}14` }]}>
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card:  { marginBottom: 16, overflow: 'hidden' },
  stripe:{ height: 3 },
  inner: { padding: 16 },

  // Header
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    marginBottom:   12,
  },
  iconWrap: {
    width:           46,
    height:          46,
    borderRadius:    radius.xl,
    borderWidth:     1,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
  },
  iconEmoji:   { fontSize: 22 },
  headerBody:  { flex: 1 },
  typeLabel: {
    ...typo.label,
    color:        colors.text.quaternary,
    marginBottom: 2,
    letterSpacing: 1,
  },
  subjectId: {
    ...typo.headline,
    color: colors.text.primary,
  },

  // Summary
  summary: {
    ...typo.body,
    color:        colors.text.secondary,
    marginBottom: 12,
    lineHeight:   20,
  },

  // Stats
  statRow: {
    flexDirection: 'row',
    gap:           6,
    flexWrap:      'wrap',
    marginBottom:  4,
  },
  statChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  statCount: { ...typo.label, fontWeight: '700' },
  statLabel: { ...typo.caption, color: colors.text.quaternary },
  durationChip: {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.border.subtle,
  },
  durationText: { ...typo.caption, color: colors.text.quaternary },

  // Layers
  layer:        { marginTop: 4 },
  layerDivider: { height: 1, marginVertical: 12 },
  layerLabel: {
    ...typo.label,
    color:         colors.text.quaternary,
    marginBottom:  10,
    letterSpacing: 1,
  },

  // Check rows
  checkRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            10,
    paddingVertical: 8,
  },
  checkDot: {
    width:          22,
    height:         22,
    borderRadius:   radius.full,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    marginTop:      1,
  },
  checkIcon:    { fontSize: 10, fontWeight: '700' },
  checkContent: { flex: 1 },
  checkLabel:   { ...typo.body, color: colors.text.secondary, fontSize: 13 },
  checkDetail:  { ...typo.caption, color: colors.text.quaternary, marginTop: 2, paddingLeft: 2 },

  // Trust chain
  trustChain: {
    flexDirection: 'row',
    alignItems:    'center',
    flexWrap:      'wrap',
    gap:           8,
    marginBottom:  12,
  },
  trustNode: {
    paddingHorizontal: 10,
    paddingVertical:   6,
    borderRadius:      radius.lg,
    borderWidth:       1,
    alignItems:        'center',
    shadowOffset:      { width: 0, height: 0 },
    shadowOpacity:     0.35,
    shadowRadius:      8,
  },
  trustNodeLabel: { ...typo.caption, fontWeight: '700', fontSize: 12 },
  trustNodeSub:   { ...typo.caption, color: colors.text.quaternary, fontSize: 9, marginTop: 1 },
  arrow:          { ...typo.caption, fontWeight: '300', fontSize: 16 },

  // Timestamp
  timestampRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  timestampLabel: { ...typo.caption, color: colors.text.quaternary },
  timestampValue: { ...typo.caption, color: colors.text.secondary },

  // Tap hint
  tapHint: {
    ...typo.caption,
    color:     colors.text.quaternary,
    textAlign: 'right',
    marginTop: 14,
  },
});
