/**
 * LoadingState
 *
 * Two display modes:
 *
 *  'spinner'      — Default. Three animated dots with staggered fade.
 *                   Used for generic async operations (data fetching, etc.)
 *
 *  'verification' — Themed for the Scan → Verify flow.
 *                   Shows a step list that animates through each step
 *                   with a live scanning beam, matching the required UI:
 *
 *                     Scanning QR         ✓
 *                     Parsing credential  ●  ← active
 *                     Checking signature  ○
 *                     Checking issuer     ○
 *                     Evaluating trust    ○
 *
 * Props for 'verification' mode:
 *   steps         — array of step labels
 *   activeStep    — index of the currently running step (0-based)
 *   completedStep — highest completed step index
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors }     from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { spacing }    from '../../theme/spacing';
import { typography } from '../../theme/typography';

// ─── Default verification steps ───────────────────────────────────────────────

export const DEFAULT_VERIFICATION_STEPS = [
  'Scanning QR code',
  'Parsing credential',
  'Checking signature',
  'Checking issuer',
  'Evaluating trust graph',
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoadingMode = 'spinner' | 'verification';

export interface LoadingStateProps {
  mode?:          LoadingMode;
  message?:       string;
  steps?:         string[];
  activeStep?:    number;
  completedStep?: number;
  style?:         StyleProp<ViewStyle>;
}

// ─── Spinner dots ─────────────────────────────────────────────────────────────

const SpinnerDots: React.FC<{ color?: string }> = ({
  color = colors.brand.primary,
}) => {
  const d = [
    useRef(new Animated.Value(0.25)).current,
    useRef(new Animated.Value(0.25)).current,
    useRef(new Animated.Value(0.25)).current,
  ];

  useEffect(() => {
    const anims = d.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1,    duration: 380, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.25, duration: 380, useNativeDriver: true }),
          Animated.delay((d.length - 1 - i) * 160),
        ]),
      ),
    );
    Animated.parallel(anims).start();
    return () => anims.forEach(a => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={dotStyles.row}>
      {d.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            dotStyles.dot,
            { backgroundColor: color, opacity: dot },
          ]}
        />
      ))}
    </View>
  );
};

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
    marginBottom:  spacing.xs,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
});

// ─── Verification step row ────────────────────────────────────────────────────

type StepStatus = 'idle' | 'active' | 'done';

const VerificationStepRow: React.FC<{
  label:  string;
  status: StepStatus;
  index:  number;
}> = ({ label, status, index }) => {
  const entryX  = useRef(new Animated.Value(-8)).current;
  const entryOp = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  // Entry stagger
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryX,  { toValue: 0, duration: 300, delay: index * 80, useNativeDriver: true }),
      Animated.timing(entryOp, { toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [entryX, entryOp, index]);

  // Active dot pulse
  useEffect(() => {
    if (status !== 'active') {
      dotPulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.5, duration: 500, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [status, dotPulse]);

  const dotColor =
    status === 'done'   ? colors.trust.verified.solid :
    status === 'active' ? colors.brand.primary :
    colors.text.quaternary;

  const textColor =
    status === 'done'   ? colors.text.secondary :
    status === 'active' ? colors.text.primary :
    colors.text.quaternary;

  const icon =
    status === 'done'   ? '✓' :
    status === 'active' ? '●' :
    '○';

  return (
    <Animated.View
      style={[
        stepStyles.row,
        { opacity: entryOp, transform: [{ translateX: entryX }] },
      ]}
    >
      {/* Connector line above (skip first item) */}
      {index > 0 && (
        <View style={stepStyles.connectorWrap}>
          <View
            style={[
              stepStyles.connector,
              status !== 'idle' && { backgroundColor: colors.trust.verified.solid },
            ]}
          />
        </View>
      )}

      <View style={stepStyles.innerRow}>
        {/* Dot */}
        <Animated.View
          style={[
            stepStyles.dotWrap,
            {
              borderColor:     dotColor,
              backgroundColor: status === 'done' ? colors.trust.verified.dim :
                               status === 'active' ? colors.brand.primaryDim : 'transparent',
              transform: [{ scale: status === 'active' ? dotPulse : 1 }],
            },
          ]}
        >
          <Text style={[stepStyles.dotIcon, { color: dotColor }]}>{icon}</Text>
        </Animated.View>

        {/* Label */}
        <Text style={[stepStyles.label, { color: textColor }]}>{label}</Text>
      </View>
    </Animated.View>
  );
};

const stepStyles = StyleSheet.create({
  row: {
    position: 'relative',
  },
  connectorWrap: {
    position:   'absolute',
    left:       15,
    top:        -10,
    height:     10,
    width:      2,
    alignItems: 'center',
  },
  connector: {
    width:           2,
    flex:            1,
    backgroundColor: colors.border.subtle,
    borderRadius:    1,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    paddingVertical: 6,
  },
  dotWrap: {
    width:        30,
    height:       30,
    borderRadius: radius.full,
    borderWidth:  1.5,
    alignItems:   'center',
    justifyContent: 'center',
    flexShrink:   0,
  },
  dotIcon: {
    fontSize:   13,
    lineHeight: 14,
    fontWeight: '600',
  },
  label: {
    ...typography.body,
    flex: 1,
  },
});

// ─── Scan beam ────────────────────────────────────────────────────────────────

const ScanBeam: React.FC = () => {
  const beam = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(beam, { toValue: 1, duration: 1600, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [beam]);

  const translateY = beam.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 48],
  });

  return (
    <View style={beamStyles.container}>
      <Animated.View
        style={[beamStyles.beam, { transform: [{ translateY }] }]}
      />
    </View>
  );
};

const beamStyles = StyleSheet.create({
  container: {
    width:        48,
    height:       48,
    borderRadius: radius.lg,
    borderWidth:  1.5,
    borderColor:  colors.brand.primary,
    overflow:     'hidden',
    marginBottom: spacing.sm,
    alignSelf:    'center',
    backgroundColor: colors.brand.primaryDim,
  },
  beam: {
    position:    'absolute',
    left:        0,
    right:       0,
    height:      2,
    backgroundColor: colors.brand.primary,
    opacity:     0.9,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

export const LoadingState: React.FC<LoadingStateProps> = ({
  mode          = 'spinner',
  message       = 'Loading…',
  steps         = DEFAULT_VERIFICATION_STEPS as unknown as string[],
  activeStep    = 0,
  completedStep = -1,
  style,
}) => {
  if (mode === 'verification') {
    const getStatus = (i: number): StepStatus => {
      if (i <= completedStep) return 'done';
      if (i === activeStep)   return 'active';
      return 'idle';
    };

    return (
      <View style={[styles.container, style]}>
        <ScanBeam />
        <View style={styles.stepList}>
          {steps.map((step, i) => (
            <VerificationStepRow
              key={step}
              label={step}
              status={getStatus(i)}
              index={i}
            />
          ))}
        </View>
      </View>
    );
  }

  // ── Spinner mode ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, style]}>
      <SpinnerDots />
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  message: {
    ...typography.bodySmall,
    color:     colors.text.tertiary,
    textAlign: 'center',
  },
  stepList: {
    alignSelf:  'stretch',
    gap:        2,
  },
});

export default LoadingState;