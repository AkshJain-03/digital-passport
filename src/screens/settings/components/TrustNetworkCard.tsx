/**
 * TrustNetworkCard
 *
 * Visual showing the four network participant types arranged in a diamond:
 *   Issuers (top) → Wallets (left) ↔ Verifiers (right) → Institutions (bottom)
 * Each participant has a count chip and description.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }    from '../../../theme/colors';
import { radius }    from '../../../theme/radius';
import { GlassCard } from '../../../components/common/GlassCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  title3:   t.title3    ?? {},
  body:     t.bodySm    ?? t.body    ?? {},
  caption:  t.captionSm ?? t.caption ?? {},
  label:    t.label     ?? {},
};

interface Participant {
  icon:   string;
  label:  string;
  desc:   string;
  count:  string;
  color:  string;
}

const PARTICIPANTS: Participant[] = [
  { icon: '🏛️', label: 'Issuers',      desc: 'Universities, govts, companies', count: '400+', color: '#0A84FF' },
  { icon: '📱', label: 'Wallets',       desc: 'Citizens holding credentials',  count: '2M+',  color: '#00FF88' },
  { icon: '🔍', label: 'Verifiers',     desc: 'Employers, retailers, services', count: '800+', color: '#7B61FF' },
  { icon: '🏢', label: 'Institutions',  desc: 'Trust anchors and registries',  count: '120+', color: '#FF8C00' },
];

export const TrustNetworkCard: React.FC = () => (
  <GlassCard padding="md" style={styles.card} glowState="trusted">
    <Text style={styles.title}>Trust Network</Text>
    <Text style={styles.sub}>The global participants behind every verification</Text>

    <View style={styles.grid}>
      {PARTICIPANTS.map((p, i) => (
        <ParticipantTile key={p.label} participant={p} index={i} />
      ))}
    </View>

    {/* Network flow diagram — simplified */}
    <View style={styles.flowRow}>
      <FlowChip label="Issuer" color="#0A84FF" />
      <FlowArrow />
      <FlowChip label="Wallet" color="#00FF88" />
      <FlowArrow />
      <FlowChip label="Verifier" color="#7B61FF" />
    </View>
  </GlassCard>
);

// ── ParticipantTile ───────────────────────────────────────────────────────────

const ParticipantTile: React.FC<{ participant: Participant; index: number }> = ({
  participant, index,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, speed: 14, bounciness: 5,
      delay: index * 80, useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const { icon, label, desc, count, color } = participant;

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          opacity:   anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          borderColor: `${color}30`,
        },
      ]}
    >
      <View style={styles.tileTop}>
        <View style={[styles.tileIcon, { backgroundColor: `${color}14`, borderColor: `${color}40`, shadowColor: color }]}>
          <Text style={styles.tileEmoji}>{icon}</Text>
        </View>
        <View style={[styles.countPill, { backgroundColor: `${color}18`, borderColor: `${color}50` }]}>
          <Text style={[styles.countText, { color }]}>{count}</Text>
        </View>
      </View>
      <Text style={[styles.tileLabel, { color }]}>{label}</Text>
      <Text style={styles.tileDesc}>{desc}</Text>
    </Animated.View>
  );
};

// ── Flow components ───────────────────────────────────────────────────────────

const FlowChip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <View style={[styles.flowChip, { borderColor: `${color}50`, backgroundColor: `${color}14` }]}>
    <Text style={[styles.flowChipText, { color }]}>{label}</Text>
  </View>
);

const FlowArrow: React.FC = () => (
  <View style={styles.flowArrowWrap}>
    <View style={[styles.flowArrowLine, { backgroundColor: colors.border.subtle }]} />
    <Text style={[styles.flowArrowHead, { color: colors.text.quaternary }]}>▶</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { ...typo.title3, color: colors.text.primary, marginBottom: 4 },
  sub:   { ...typo.body, color: colors.text.tertiary, marginBottom: 16 },

  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
    marginBottom:  16,
  },

  tile: {
    width:           '47.5%',
    backgroundColor: colors.glass.light,
    borderRadius:    radius.xl,
    borderWidth:     1,
    padding:         12,
    gap:             6,
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tileIcon: {
    width:          36,
    height:         36,
    borderRadius:   radius.lg,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.25,
    shadowRadius:   8,
  },
  tileEmoji:  { fontSize: 16 },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  countText:  { ...typo.label, fontWeight: '800', fontSize: 10 },
  tileLabel:  { ...typo.label, fontWeight: '700' },
  tileDesc:   { ...typo.caption, color: colors.text.quaternary },

  // Flow row
  flowRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    paddingTop:     14,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  flowChip: {
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  flowChipText: { ...typo.label, fontWeight: '700', fontSize: 11 },
  flowArrowWrap: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  flowArrowLine: { width: 16, height: 1.5, borderRadius: 1 },
  flowArrowHead: { fontSize: 8, marginLeft: -2 },
});
