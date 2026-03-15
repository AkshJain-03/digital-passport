/**
 * VerificationFlowCard
 *
 * Animated step-by-step visualization of the verification pipeline:
 *   Scan → Signature Check → Issuer Check → Trust Graph → Result
 *
 * Steps auto-advance on mount with a stagger delay.
 * Each step lights up with a colour and a connecting line fills in.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }    from '../../../theme/colors';
import { radius }    from '../../../theme/radius';
import { GlassCard } from '../../../components/common/GlassCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.bodySm    ?? t.body     ?? {},
  caption:  t.captionSm ?? t.caption  ?? {},
  label:    t.label     ?? {},
};

interface FlowStep {
  icon:    string;
  label:   string;
  detail:  string;
  color:   string;
}

const STEPS: FlowStep[] = [
  { icon: '⊡', label: 'Scan QR',         detail: 'Camera reads QR payload',           color: '#00D4FF' },
  { icon: '🔐', label: 'Signature Check', detail: 'Ed25519 signature verified',        color: '#7B61FF' },
  { icon: '🏛️', label: 'Issuer Check',    detail: 'DID resolved in registry',          color: '#0A84FF' },
  { icon: '🕸',  label: 'Trust Graph',    detail: 'Chain of trust evaluated',          color: '#FFD60A' },
  { icon: '✓',  label: 'Result',          detail: 'Trust state determined instantly',  color: '#00FF88' },
];

const STEP_DELAY = 600;

export const VerificationFlowCard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(-1);
  const lineAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;
  const dotAnims  = useRef(STEPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let step = 0;

    const advance = () => {
      if (step >= STEPS.length) return;

      setActiveStep(step);

      // Dot spring in
      Animated.spring(dotAnims[step], {
        toValue: 1, speed: 18, bounciness: 8, useNativeDriver: true,
      }).start();

      // Connecting line fills (except last step)
      if (step < STEPS.length - 1) {
        Animated.timing(lineAnims[step], {
          toValue: 1, duration: STEP_DELAY * 0.7, useNativeDriver: false,
        }).start();
      }

      step++;
      setTimeout(advance, STEP_DELAY);
    };

    const timer = setTimeout(advance, 400);
    return () => clearTimeout(timer);
  }, [dotAnims, lineAnims]);

  return (
    <GlassCard padding="md" style={styles.card}>
      <Text style={styles.header}>Verification Pipeline</Text>
      <Text style={styles.subheader}>How every scan becomes a trust decision</Text>

      <View style={styles.flow}>
        {STEPS.map((step, i) => {
          const isDone   = i < activeStep;
          const isActive = i === activeStep;
          const color    = (isDone || isActive) ? step.color : colors.border.subtle;
          const isLast   = i === STEPS.length - 1;

          return (
            <View key={step.label} style={styles.stepRow}>
              {/* ── Dot + connector ─────────────────────────────────── */}
              <View style={styles.dotCol}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      borderColor:     color,
                      backgroundColor: (isDone || isActive) ? `${color}20` : 'transparent',
                      shadowColor:     color,
                      transform:       [{ scale: dotAnims[i].interpolate({
                        inputRange: [0, 1], outputRange: [0.5, 1],
                      }) }],
                    },
                  ]}
                >
                  <Text style={[styles.dotIcon, { color: (isDone || isActive) ? color : colors.text.quaternary }]}>
                    {isDone ? '✓' : step.icon}
                  </Text>
                </Animated.View>

                {!isLast && (
                  <View style={styles.lineTrack}>
                    <Animated.View
                      style={[
                        styles.lineFill,
                        {
                          height:          lineAnims[i].interpolate({
                            inputRange: [0, 1], outputRange: ['0%', '100%'],
                          }),
                          backgroundColor: step.color,
                        },
                      ]}
                    />
                  </View>
                )}
              </View>

              {/* ── Step content ─────────────────────────────────────── */}
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, (isDone || isActive) && { color: colors.text.primary }]}>
                  {step.label}
                </Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>

              {/* ── Active / done indicator ──────────────────────────── */}
              {isActive && (
                <View style={[styles.activePill, { borderColor: `${step.color}50`, backgroundColor: `${step.color}14` }]}>
                  <View style={[styles.activeDot, { backgroundColor: step.color }]} />
                  <Text style={[styles.activeText, { color: step.color }]}>now</Text>
                </View>
              )}
              {isDone && (
                <Text style={[styles.doneMark, { color: step.color }]}>✓</Text>
              )}
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const DOT_SIZE = 36;

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header:    { ...typo.headline, color: colors.text.primary, marginBottom: 3 },
  subheader: { ...typo.body, color: colors.text.tertiary, marginBottom: 18 },

  flow: { gap: 0 },

  stepRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            14,
    minHeight:      52,
  },

  // Dot + line
  dotCol:    { alignItems: 'center', width: DOT_SIZE },
  dot: {
    width:          DOT_SIZE,
    height:         DOT_SIZE,
    borderRadius:   radius.full,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.4,
    shadowRadius:   10,
  },
  dotIcon: { fontSize: 14, fontWeight: '700' },
  lineTrack: {
    width:           2,
    flex:            1,
    backgroundColor: colors.border.hairline,
    overflow:        'hidden',
    minHeight:       16,
  },
  lineFill: {
    width:    '100%',
    position: 'absolute',
    top:      0,
  },

  // Step text
  stepContent: {
    flex:       1,
    paddingTop: 7,
    paddingBottom: 12,
  },
  stepLabel:  { ...typo.label, color: colors.text.tertiary, marginBottom: 2 },
  stepDetail: { ...typo.caption, color: colors.text.quaternary },

  // Indicators
  activePill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 7,
    paddingVertical:   3,
    borderRadius:      radius.full,
    borderWidth:       1,
    alignSelf:         'flex-start',
    marginTop:         7,
  },
  activeDot: { width: 5, height: 5, borderRadius: 2.5 },
  activeText: { ...typo.caption, fontSize: 9, fontWeight: '700' },
  doneMark:   { ...typo.body, fontWeight: '700', marginTop: 7 },
});
