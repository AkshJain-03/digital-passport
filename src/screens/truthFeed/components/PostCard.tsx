/**
 * PostCard
 *
 * Glass card for a single Truth Feed post.
 * 3-layer progressive reveal:
 *   Layer 0 — Author + content + claim bar + footer
 *   Layer 1 — Author DID + credential-backed identity details
 *   Layer 2 — AI fraud signals with severity + remediation
 *
 * Fraud signal types shown in Layer 2:
 *   unknown_issuer / revoked_credential / suspicious_institution /
 *   invalid_signature / unverified_author / unverified_claims / no_source
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import { GlassCard }  from '../../../components/common/GlassCard';
import { AuthorBadge }      from './AuthorBadge';
import { ClaimBar }         from './ClaimBar';
import { FraudSignalBadge } from './FraudSignalBadge';
import type { PostWithFraud } from '../../../hooks/useTruthFeed';
import type { TrustState }    from '../../../theme/colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  body:     t.body     ?? {},
  bodySm:   t.bodySm   ?? t.body    ?? {},
  caption:  t.captionSm ?? t.caption ?? {},
  label:    t.label    ?? {},
  buttonXs: t.buttonXs ?? t.button  ?? {},
};

interface PostCardProps {
  post:     PostWithFraud;
  index:    number;
  onVerify: (id: string) => Promise<void>;
}

export const PostCard: React.FC<PostCardProps> = ({ post, index, onVerify }) => {
  const [tapLayer,  setTapLayer]  = useState(0);
  const [verifying, setVerifying] = useState(false);

  const entryAnim  = useRef(new Animated.Value(0)).current;
  const layer1Anim = useRef(new Animated.Value(0)).current;
  const layer2Anim = useRef(new Animated.Value(0)).current;

  // Staggered entry
  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1, duration: 380, delay: index * 80, useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  // Layer slide-up reveals
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

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    await onVerify(post.id);
    setVerifying(false);
  }, [onVerify, post.id]);

  const trustColor  = colors.trust[post.trustState as TrustState]?.solid ?? colors.brand.primary;
  const fraud       = post.fraudAnalysis;
  const signalCount = fraud?.signals.length ?? 0;
  const highSignals = fraud?.signals.filter(s => s.severity === 'high' || s.severity === 'critical') ?? [];

  return (
    <Animated.View
      style={{
        opacity:   entryAnim,
        transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      <GlassCard
        glowState={post.trustState as TrustState}
        padding="none"
        revealLayers={3}
        onTapLayer={setTapLayer}
        style={styles.card}
      >
        {/* ── Top accent stripe ──────────────────────────────────────── */}
        <View style={[styles.stripe, { backgroundColor: trustColor }]} />

        <View style={styles.inner}>
          {/* ── Layer 0: Main content ─────────────────────────────────── */}

          {/* Author row */}
          <View style={styles.authorWrap}>
            <AuthorBadge author={post.author} />
          </View>

          {/* Content */}
          <Text style={styles.content}>{post.content}</Text>

          {/* Claim bar */}
          <ClaimBar
            claimCount={post.claimCount}
            verifiedClaimCount={post.verifiedClaimCount}
          />

          {/* Fraud signal count hint (if any) */}
          {signalCount > 0 && (
            <View style={styles.signalHintRow}>
              {highSignals.slice(0, 2).map(s => (
                <View
                  key={s.id}
                  style={[
                    styles.signalHintChip,
                    {
                      borderColor: `${colors.trust[
                        s.severity === 'critical' ? 'revoked' : 'suspicious'
                      ]?.solid}50`,
                      backgroundColor: `${colors.trust[
                        s.severity === 'critical' ? 'revoked' : 'suspicious'
                      ]?.solid}12`,
                    },
                  ]}
                >
                  <Text style={[
                    styles.signalHintText,
                    { color: colors.trust[s.severity === 'critical' ? 'revoked' : 'suspicious']?.solid },
                  ]}>
                    ⚠ {s.label}
                  </Text>
                </View>
              ))}
              {signalCount > 2 && (
                <Text style={styles.signalMore}>+{signalCount - 2} more</Text>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {post.sourceName && <Text style={styles.source}>{post.sourceName}</Text>}
              <Text style={styles.timestamp}>
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={verifying}
              activeOpacity={0.7}
              style={[styles.verifyBtn, { borderColor: `${trustColor}50` }]}
            >
              <Text style={[styles.verifyText, { color: trustColor }]}>
                {verifying ? 'Checking…' : '⟳ Verify'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Layer 1: Author identity ──────────────────────────────── */}
          {tapLayer >= 1 && (
            <Animated.View
              style={[
                styles.layer,
                {
                  opacity:   layer1Anim,
                  transform: [{ translateY: layer1Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                },
              ]}
            >
              <View style={[styles.layerDivider, { backgroundColor: `${trustColor}30` }]} />
              <Text style={styles.layerLabel}>AUTHOR IDENTITY</Text>

              <AuthorBadge author={post.author} showDid />

              {post.author.institution && (
                <View style={styles.institutionRow}>
                  <Text style={styles.institutionIcon}>🏛️</Text>
                  <Text style={styles.institutionText}>{post.author.institution}</Text>
                </View>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {post.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* ── Layer 2: AI fraud signals ─────────────────────────────── */}
          {tapLayer >= 2 && (
            <Animated.View
              style={[
                styles.layer,
                {
                  opacity:   layer2Anim,
                  transform: [{ translateY: layer2Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                },
              ]}
            >
              <View style={[styles.layerDivider, { backgroundColor: `${trustColor}30` }]} />

              <View style={styles.fraudHeader}>
                <Text style={styles.layerLabel}>AI FRAUD SIGNALS</Text>
                {fraud && (
                  <View style={[styles.riskScorePill, {
                    borderColor: `${trustColor}50`,
                    backgroundColor: `${trustColor}14`,
                  }]}>
                    <Text style={[styles.riskScoreText, { color: trustColor }]}>
                      Risk: {fraud.riskScore}/100
                    </Text>
                  </View>
                )}
              </View>

              {fraud && fraud.signals.length > 0 ? (
                fraud.signals.map(signal => (
                  <FraudSignalBadge
                    key={signal.id}
                    signal={signal}
                    showRemediation
                  />
                ))
              ) : (
                <View style={styles.cleanRow}>
                  <Text style={styles.cleanIcon}>✓</Text>
                  <Text style={styles.cleanText}>No fraud signals detected</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Tap hint */}
          <Text style={styles.tapHint}>
            {tapLayer === 0 ? '↓  Tap for author identity'
              : tapLayer === 1 ? '↓  Tap for fraud signals'
              : '↑  Tap to collapse'}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card:   { marginBottom: 14, overflow: 'hidden' },
  stripe: { height: 3 },
  inner:  { padding: 14 },

  authorWrap: { marginBottom: 12 },

  content: {
    ...typo.body,
    color:        colors.text.secondary,
    lineHeight:   22,
    marginBottom: 12,
  },

  // Fraud hint chips above footer
  signalHintRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginBottom:  10,
  },
  signalHintChip: {
    paddingHorizontal: 7,
    paddingVertical:   3,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  signalHintText: {
    ...typo.caption,
    fontSize:   10,
    fontWeight: '600',
  },
  signalMore: { ...typo.caption, color: colors.text.quaternary, alignSelf: 'center' },

  // Footer
  footer: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  footerLeft: { gap: 2 },
  source:     { ...typo.caption, color: colors.text.tertiary, fontSize: 10 },
  timestamp:  { ...typo.caption, color: colors.text.quaternary },
  verifyBtn: {
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  verifyText: { ...typo.buttonXs, fontWeight: '600' },

  // Layers
  layer:        { marginTop: 4 },
  layerDivider: { height: 1, marginVertical: 12 },
  layerLabel: {
    ...typo.label,
    color:         colors.text.quaternary,
    marginBottom:  10,
    letterSpacing: 1,
  },

  // Institution
  institutionRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginTop:     8,
    paddingTop:    8,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  institutionIcon: { fontSize: 12 },
  institutionText: { ...typo.caption, color: colors.text.secondary, flex: 1 },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    paddingHorizontal: 7,
    paddingVertical:   2,
    backgroundColor:   colors.glass.medium,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.border.subtle,
  },
  tagText: { ...typo.caption, color: colors.text.tertiary },

  // Fraud
  fraudHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
  },
  riskScorePill: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  riskScoreText: { ...typo.caption, fontWeight: '700' },
  cleanRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  cleanIcon: { color: colors.trust.verified.solid, fontSize: 14, fontWeight: '700' },
  cleanText: { ...typo.body, color: colors.text.secondary },

  tapHint: {
    ...typo.caption,
    color:     colors.text.quaternary,
    textAlign: 'right',
    marginTop: 12,
  },
});
