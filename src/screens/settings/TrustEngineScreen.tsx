/**
 * TrustEngineScreen
 *
 * Explains the global trust infrastructure behind Sovereign Trust.
 *
 * Sections:
 *   1. The Simple Principle     — Why trust should be instant
 *   2. The Trust Graph          — Interactive node graph
 *   3. Verification Engine      — Animated 5-step pipeline
 *   4. Global Use Cases         — 6-tile use case grid
 *   5. Trust Network            — Issuers / Wallets / Verifiers / Institutions
 *   6. Future of Trust          — Vision statement card
 *
 * Lives in src/screens/settings/ per README architecture.
 */

import React, { useEffect, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';

import { colors }    from '../../theme/colors';
import { radius }    from '../../theme/radius';
import { GlassCard } from '../../components/common/GlassCard';
import { AppBadge }  from '../../components/common/AppBadge';
import { LiquidBackButton } from '../../components/common/LiquidBackButton';

import { TrustConceptCard }    from './components/TrustConceptCard';
import { TrustGraphCard }      from './components/TrustGraphCard';
import { VerificationFlowCard } from './components/VerificationFlowCard';
import { UseCaseGrid }         from './components/UseCaseGrid';
import { TrustNetworkCard }    from './components/TrustNetworkCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title1:   t.title1   ?? {},
  title2:   t.title2   ?? {},
  title3:   t.title3   ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.bodySm   ?? t.body      ?? {},
  caption:  t.captionSm ?? t.caption  ?? {},
  label:    t.label    ?? {},
  display:  t.displaySm ?? t.display  ?? {},
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  step:   string;
  title:  string;
  color:  string;
}> = ({ step, title, color }) => (
  <View style={sectionStyles.row}>
    <View style={[sectionStyles.stepBadge, { borderColor: `${color}50`, backgroundColor: `${color}14` }]}>
      <Text style={[sectionStyles.stepText, { color }]}>{step}</Text>
    </View>
    <Text style={sectionStyles.title}>{title}</Text>
  </View>
);

const sectionStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 28 },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  stepText:  { ...typo.label, fontWeight: '800', fontSize: 11 },
  title:     { ...typo.title3, color: colors.text.primary },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const TrustEngineScreen: React.FC = () => {
  const nav = useNavigation();

  const headerAnim   = useRef(new Animated.Value(0)).current;
  const contentFade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, contentFade]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBar, { opacity: headerAnim }]}>
        <LiquidBackButton onPress={() => nav.goBack()} />
        <AppBadge label="Trust Engine" variant="trusted" size="md" />
        <View style={{ width: 60 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Animated.View style={{ opacity: contentFade }}>

          {/* ── Hero header ───────────────────────────────────────────── */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Text style={styles.heroIcon}>🌐</Text>
            </View>
            <Text style={styles.heroTitle}>Trust Engine</Text>
            <Text style={styles.heroSub}>
              The global infrastructure for instant, cryptographic verification
            </Text>
          </View>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 1. The Simple Principle                                       */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SectionHeader step="01" title="The Simple Principle" color="#00D4FF" />

          <TrustConceptCard
            icon="⊡"
            title="Scan to Trust"
            body="Trust should be as easy as scanning a QR code. No forms, no waiting, no third party. One scan and you know."
            accentColor="#00D4FF"
            index={0}
          />
          <TrustConceptCard
            icon="🔐"
            title="Cryptographic Proof"
            body="Every credential is signed with an Ed25519 key anchored to hardware. Forgery is mathematically impossible."
            accentColor="#7B61FF"
            index={1}
          />
          <TrustConceptCard
            icon="📱"
            title="Hardware-Secured Identity"
            body="Your DID lives in your phone's Secure Enclave — never leaves the device. You control your own identity."
            accentColor="#00FF88"
            index={2}
          />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 2. The Trust Graph                                            */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SectionHeader step="02" title="The Trust Graph" color="#7B61FF" />

          <Text style={styles.sectionBody}>
            Trust isn't binary — it's a graph. Every credential traces back to an issuer,
            which traces back to an institution. Tap a graph to explore real-world examples.
          </Text>
          <TrustGraphCard />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 3. Verification Engine                                        */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SectionHeader step="03" title="Verification Engine" color="#0A84FF" />

          <Text style={styles.sectionBody}>
            From scan to trust decision in under 400 milliseconds.
            Five checks run in parallel — every time.
          </Text>
          <VerificationFlowCard />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 4. Global Use Cases                                           */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SectionHeader step="04" title="Global Use Cases" color="#FFD60A" />

          <Text style={styles.sectionBody}>
            Any claim that can be signed can be verified instantly —
            from university degrees to pharmaceutical supply chains.
          </Text>
          <UseCaseGrid />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 5. Trust Network                                              */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SectionHeader step="05" title="Trust Network" color="#0A84FF" />

          <Text style={styles.sectionBody}>
            Sovereign Trust is powered by a growing network of issuers,
            wallets, verifiers, and institutions.
          </Text>
          <TrustNetworkCard />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 6. Future of Trust                                            */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SectionHeader step="06" title="The Future of Trust" color="#00FF88" />

          <GlassCard glowState="verified" animateGlow padding="none" style={styles.futureCard}>
            <View style={[styles.futureStripe, { backgroundColor: colors.trust.verified.solid }]} />
            <View style={styles.futureInner}>
              <Text style={styles.futureQuote}>
                "Instant verification for{'\n'}everything that matters."
              </Text>
              <Text style={styles.futureBody}>
                A world where your degree is verified before your interview ends.
                Where a medicine is authenticated before it's dispensed.
                Where your identity can't be stolen.{'\n\n'}
                That's the future Sovereign Trust is building — one credential at a time.
              </Text>
              <View style={styles.futureMeta}>
                <AppBadge label="In Development" variant="pending" size="sm" />
                <Text style={styles.futureVersion}>v1.0 · March 2025</Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: 'transparent',
    paddingTop:      Platform.OS === 'ios' ? 66 : 46,
  },

  // Top bar
  topBar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    marginBottom:      12,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 128 },

  // Hero
  hero: {
    alignItems:   'center',
    paddingTop:   16,
    paddingBottom: 8,
    gap:           10,
  },
  heroIconWrap: {
    width:           72,
    height:          72,
    borderRadius:    radius.full,
    backgroundColor: `${colors.brand.primary}18`,
    borderWidth:     1.5,
    borderColor:     `${colors.brand.primary}50`,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     colors.brand.primary,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.35,
    shadowRadius:    20,
  },
  heroIcon:  { fontSize: 34 },
  heroTitle: { ...typo.title2, color: colors.text.primary, textAlign: 'center' },
  heroSub:   { ...typo.body, color: colors.text.tertiary, textAlign: 'center', lineHeight: 22 },

  sectionBody: {
    ...typo.body,
    color:        colors.text.tertiary,
    marginBottom: 14,
    lineHeight:   22,
  },

  // Future card
  futureCard:   { overflow: 'hidden', marginBottom: 12 },
  futureStripe: { height: 3 },
  futureInner:  { padding: 20, gap: 14 },
  futureQuote: {
    ...typo.title2,
    color:      colors.trust.verified.solid,
    lineHeight: 32,
  },
  futureBody: {
    ...typo.body,
    color:      colors.text.secondary,
    lineHeight: 22,
  },
  futureMeta: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      4,
  },
  futureVersion: { ...typo.caption, color: colors.text.quaternary },
});

export default TrustEngineScreen;
