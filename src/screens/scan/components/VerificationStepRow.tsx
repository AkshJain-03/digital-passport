/**
 * VerificationStepRow
 *
 * Single animated step in the scan verification pipeline.
 * States: idle → active (pulse glow) → done → error
 *
 * Upgrades vs previous:
 *  • Per-step accent colour from SCAN_TYPE_META (passed via accentColor prop)
 *  • Done tag fades/scales in with spring
 *  • Step number badge behind dot on idle steps
 *  • Connecting line between steps (drawn by parent via borderLeft on container)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import type { VerificationStepStatus } from '../../../domain/verification/verificationTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  body:    t.bodySm   ?? t.body   ?? {},
  caption: t.captionSm ?? t.caption ?? {},
  label:   t.label   ?? {},
};

interface VerificationStepRowProps {
  label:        string;
  status:       VerificationStepStatus;
  index:        number;
  totalSteps:   number;
  accentColor?: string;   // fallback = brand.primary
}

export const VerificationStepRow: React.FC<VerificationStepRowProps> = ({
  label,
  status,
  index,
  totalSteps,
  accentColor = colors.brand.primary,
}) => {
  const entryOp   = useRef(new Animated.Value(0)).current;
  const entryX    = useRef(new Animated.Value(-14)).current;
  const dotScale  = useRef(new Animated.Value(0.5)).current;
  const pulse     = useRef(new Animated.Value(1)).current;
  const doneScale = useRef(new Animated.Value(0)).current;
  const lineAnim  = useRef(new Animated.Value(0)).current;

  const isLast = index === totalSteps - 1;

  // Entry slide-in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOp, {
        toValue: 1, duration: 280, delay: index * 70, useNativeDriver: true,
      }),
      Animated.spring(entryX, {
        toValue: 0, speed: 22, bounciness: 5, delay: index * 70, useNativeDriver: true,
      }),
      Animated.spring(dotScale, {
        toValue: 1, speed: 20, bounciness: 7, delay: index * 70 + 60, useNativeDriver: true,
      }),
    ]).start();
  }, [entryOp, entryX, dotScale, index]);

  // Active glow pulse
  useEffect(() => {
    if (status !== 'active') { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  // Done tag spring + connector line fill
  useEffect(() => {
    if (status === 'done') {
      Animated.spring(doneScale, {
        toValue: 1, speed: 18, bounciness: 8, useNativeDriver: true,
      }).start();
      Animated.timing(lineAnim, {
        toValue: 1, duration: 320, useNativeDriver: true,
      }).start();
    } else {
      doneScale.setValue(0);
      lineAnim.setValue(0);
    }
  }, [status, doneScale, lineAnim]);

  const dotColor =
    status === 'done'   ? colors.trust.verified.solid :
    status === 'error'  ? colors.trust.revoked.solid  :
    status === 'active' ? accentColor                 :
    colors.border.subtle;

  const dotBg =
    status === 'done'   ? `${colors.trust.verified.solid}20` :
    status === 'active' ? `${accentColor}20`                 :
    'transparent';

  const icon =
    status === 'done'   ? '✓' :
    status === 'error'  ? '✕' :
    status === 'active' ? '●' : `${index + 1}`;

  return (
    <Animated.View
      style={[
        styles.row,
        { opacity: entryOp, transform: [{ translateX: entryX }] },
      ]}
    >
      {/* ── Left: dot + connector line ────────────────────────────────── */}
      <View style={styles.dotCol}>
        <Animated.View
          style={[
            styles.dot,
            {
              borderColor:     dotColor,
              backgroundColor: dotBg,
              shadowColor:     dotColor,
              transform: [
                { scale: dotScale },
                { scale: status === 'active' ? pulse : 1 },
              ],
            },
          ]}
        >
          <Text style={[styles.dotIcon, { color: dotColor }]}>{icon}</Text>
        </Animated.View>

        {/* Connector line to next step */}
        {!isLast && (
          <View style={styles.lineTrack}>
            <Animated.View
              style={[
                styles.lineFill,
                {
                  height:          lineAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  backgroundColor: colors.trust.verified.solid,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* ── Right: label + done tag ───────────────────────────────────── */}
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            status === 'active' && { color: colors.text.primary, fontWeight: '600' },
            status === 'done'   && { color: colors.text.secondary },
          ]}
        >
          {label}
        </Text>

        {status === 'done' && (
          <Animated.View
            style={[
              styles.doneTag,
              { transform: [{ scale: doneScale }] },
            ]}
          >
            <Text style={styles.doneText}>✓ done</Text>
          </Animated.View>
        )}

        {status === 'active' && (
          <View style={[styles.activeTag, { borderColor: `${accentColor}60`, backgroundColor: `${accentColor}14` }]}>
            <View style={[styles.activeBlink, { backgroundColor: accentColor }]} />
            <Text style={[styles.activeText, { color: accentColor }]}>checking</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const DOT_SIZE = 30;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    minHeight:     44,
  },

  // Dot + line column
  dotCol: {
    alignItems: 'center',
    width:      DOT_SIZE,
    marginRight: 12,
  },
  dot: {
    width:          DOT_SIZE,
    height:         DOT_SIZE,
    borderRadius:   radius.full,
    borderWidth:    1.5,
    alignItems:     'center',
    justifyContent: 'center',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.55,
    shadowRadius:   8,
    flexShrink:     0,
  },
  dotIcon: { fontSize: 11, fontWeight: '700' },
  lineTrack: {
    width:           2,
    flex:            1,
    backgroundColor: colors.border.hairline,
    marginTop:       3,
    overflow:        'hidden',
    minHeight:       12,
  },
  lineFill: {
    width: '100%',
    position: 'absolute',
    top: 0,
  },

  // Content
  content: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    paddingTop:     7,
    paddingBottom:  10,
    gap:            8,
    flexWrap:       'wrap',
  },
  label: {
    ...typo.body,
    color:    colors.text.tertiary,
    flex:     1,
    fontSize: 13,
  },

  // Done tag
  doneTag: {
    backgroundColor: `${colors.trust.verified.solid}18`,
    borderRadius:    radius.full,
    paddingHorizontal: 7,
    paddingVertical:   2,
    borderWidth:     1,
    borderColor:     `${colors.trust.verified.solid}40`,
  },
  doneText: {
    ...typo.caption,
    color:    colors.trust.verified.solid,
    fontSize: 9,
    fontWeight: '600',
  },

  // Active tag
  activeTag: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    borderRadius:      radius.full,
    paddingHorizontal: 7,
    paddingVertical:   2,
    borderWidth:       1,
  },
  activeBlink: {
    width:        5,
    height:       5,
    borderRadius: 2.5,
  },
  activeText: {
    ...typo.caption,
    fontSize:   9,
    fontWeight: '600',
  },
});
