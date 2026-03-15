/**
 * FraudSignalBadge
 *
 * Compact row showing a single fraud signal with severity colour,
 * emoji indicator, label, and optional remediation text.
 * Used inside PostCard Layer 2.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import {
  FRAUD_SIGNAL_META,
  SEVERITY_COLOR,
  type FraudSignal,
} from '../../../domain/truth/truthTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  caption: t.captionSm ?? t.caption ?? {},
  label:   t.label     ?? {},
};

interface FraudSignalBadgeProps {
  signal:           FraudSignal;
  showRemediation?: boolean;
}

export const FraudSignalBadge: React.FC<FraudSignalBadgeProps> = ({
  signal,
  showRemediation = false,
}) => {
  const color = SEVERITY_COLOR[signal.severity];
  const meta  = FRAUD_SIGNAL_META[signal.id];

  return (
    <View style={[styles.row, { borderColor: `${color}30`, backgroundColor: `${color}0A` }]}>
      {/* Severity dot */}
      <View style={[styles.dot, { backgroundColor: color, shadowColor: color }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.emoji}>{meta?.emoji ?? '⚠'}</Text>
          <Text style={[styles.label, { color }]}>{signal.label}</Text>
          <View style={[styles.severityTag, { borderColor: `${color}50`, backgroundColor: `${color}18` }]}>
            <Text style={[styles.severityText, { color }]}>{signal.severity}</Text>
          </View>
        </View>

        {signal.detail && (
          <Text style={styles.detail}>{signal.detail}</Text>
        )}

        {showRemediation && signal.remediation && (
          <View style={styles.remediationRow}>
            <Text style={styles.remediationIcon}>💡</Text>
            <Text style={styles.remediationText}>{signal.remediation}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               10,
    paddingHorizontal: 10,
    paddingVertical:   8,
    borderRadius:      radius.lg,
    borderWidth:       1,
    marginBottom:      6,
  },

  dot: {
    width:         8,
    height:        8,
    borderRadius:  4,
    marginTop:     4,
    flexShrink:    0,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  4,
  },

  body:   { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  emoji:  { fontSize: 12 },
  label:  { ...typo.label, fontWeight: '600', flex: 1 },

  severityTag: {
    paddingHorizontal: 5,
    paddingVertical:   1,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  severityText: { ...typo.caption, fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },

  detail: { ...typo.caption, color: colors.text.tertiary, marginTop: 3 },

  remediationRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            5,
    marginTop:      5,
    paddingTop:     5,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  remediationIcon: { fontSize: 10, marginTop: 1 },
  remediationText: { ...typo.caption, color: colors.text.secondary, flex: 1, fontSize: 10 },
});
