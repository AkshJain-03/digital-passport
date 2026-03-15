/**
 * TrustConceptCard
 *
 * Glass card explaining one key concept of the trust system.
 * Large emoji icon, headline, body text, optional accent stripe.
 * Animates in with a spring on mount.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import { GlassCard } from '../../../components/common/GlassCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  title3:   t.title3    ?? {},
  body:     t.bodySm    ?? t.body    ?? {},
  caption:  t.captionSm ?? t.caption ?? {},
  label:    t.label     ?? {},
};

interface TrustConceptCardProps {
  icon:        string;
  title:       string;
  body:        string;
  accentColor: string;
  index?:      number;   // stagger delay
}

export const TrustConceptCard: React.FC<TrustConceptCardProps> = ({
  icon,
  title,
  body,
  accentColor,
  index = 0,
}) => {
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue:    1,
      speed:      14,
      bounciness: 5,
      delay:      index * 80,
      useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  return (
    <Animated.View
      style={{
        opacity:   entryAnim,
        transform: [{
          translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
        }],
      }}
    >
      <GlassCard padding="none" style={styles.card}>
        {/* Accent stripe */}
        <View style={[styles.stripe, { backgroundColor: accentColor }]} />

        <View style={styles.inner}>
          {/* Icon */}
          <View style={[styles.iconWrap, {
            backgroundColor: `${accentColor}14`,
            borderColor:     `${accentColor}40`,
            shadowColor:     accentColor,
          }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Text */}
          <View style={styles.textWrap}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card:   { overflow: 'hidden', marginBottom: 12 },
  stripe: { height: 3 },
  inner: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           14,
    padding:       16,
  },
  iconWrap: {
    width:          48,
    height:         48,
    borderRadius:   radius.xl,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.3,
    shadowRadius:   10,
  },
  icon:     { fontSize: 24 },
  textWrap: { flex: 1 },
  title:    { ...typo.title3, color: colors.text.primary, marginBottom: 6 },
  body:     { ...typo.body, color: colors.text.secondary, lineHeight: 20 },
});
