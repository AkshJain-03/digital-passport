/**
 * UseCaseGrid
 *
 * 2-column grid of global trust use cases:
 *   Identity / Credentials / Products / Licenses / Documents / Institutions
 *
 * Each tile springs in with a stagger and shows icon + title + description.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  headline: t.headlineSm ?? t.headline ?? {},
  caption:  t.captionSm  ?? t.caption  ?? {},
  label:    t.label      ?? {},
};

interface UseCase {
  icon:   string;
  title:  string;
  desc:   string;
  color:  string;
}

const USE_CASES: UseCase[] = [
  { icon: '🪪', title: 'Identity',     desc: 'Aadhaar, passport, voter ID',   color: '#00D4FF' },
  { icon: '🎓', title: 'Credentials',  desc: 'Degrees, certificates, skills', color: '#7B61FF' },
  { icon: '📦', title: 'Products',     desc: 'Authenticity, supply chain',    color: '#FFD60A' },
  { icon: '📋', title: 'Licenses',     desc: 'Driving, professional, trade',  color: '#0A84FF' },
  { icon: '📄', title: 'Documents',    desc: 'Signed contracts, invoices',    color: '#FF8C00' },
  { icon: '🏛️', title: 'Institutions', desc: 'Govt, hospitals, universities', color: '#00FF88' },
];

export const UseCaseGrid: React.FC = () => (
  <View style={styles.grid}>
    {USE_CASES.map((uc, i) => (
      <UseCaseTile key={uc.title} useCase={uc} index={i} />
    ))}
  </View>
);

// ── Tile ──────────────────────────────────────────────────────────────────────

const UseCaseTile: React.FC<{ useCase: UseCase; index: number }> = ({ useCase, index }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, speed: 14, bounciness: 5,
      delay: index * 60, useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const { icon, title, desc, color } = useCase;

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          opacity:   anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
        },
      ]}
    >
      {/* Glow orb */}
      <View style={[styles.orb, { backgroundColor: `${color}10` }]} />

      <View style={[styles.iconWrap, { borderColor: `${color}40`, backgroundColor: `${color}14`, shadowColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={[styles.title, { color }]}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
  },

  tile: {
    width:           '47.5%',
    backgroundColor: colors.glass.light,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    borderColor:     colors.border.subtle,
    padding:         14,
    overflow:        'hidden',
    position:        'relative',
    gap:             8,
  },

  orb: {
    position:     'absolute',
    top:          -16,
    right:        -16,
    width:        64,
    height:       64,
    borderRadius: 32,
  },

  iconWrap: {
    width:          40,
    height:         40,
    borderRadius:   radius.lg,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.25,
    shadowRadius:   8,
  },
  icon:  { fontSize: 18 },
  title: { ...typo.label, fontWeight: '700' },
  desc:  { ...typo.caption, color: colors.text.quaternary },
});
