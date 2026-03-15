/**
 * TrustGraphCard
 *
 * Visual representation of a trust graph: nodes connected by labelled arrows.
 * Renders nodes left→right with connecting arrow lines between them.
 * Nodes pulse with their trust-state colour on mount.
 * Active graph is selectable via top pills (Education / Product / Identity / Network).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors }   from '../../../theme/colors';
import { radius }   from '../../../theme/radius';
import { GlassCard } from '../../../components/common/GlassCard';
import { trustGraphEngine } from '../../../domain/trustGraph/trustGraphEngine';
import { NODE_TYPE_META }   from '../../../domain/trustGraph/trustNode';
import { EDGE_TYPE_META }   from '../../../domain/trustGraph/trustEdge';
import type { TrustGraph }  from '../../../domain/trustGraph/trustGraphEngine';
import type { TrustState }  from '../../../theme/colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../../theme/typography').typography) as Record<string, any>;
const typo = {
  headline: t.headlineSm ?? t.headline ?? {},
  body:     t.bodySm    ?? t.body     ?? {},
  caption:  t.captionSm ?? t.caption  ?? {},
  label:    t.label     ?? {},
  mono:     t.mono      ?? {},
};

export const TrustGraphCard: React.FC = () => {
  const graphs = trustGraphEngine.getAllGraphs();
  const [activeIdx, setActiveIdx] = useState(0);
  const graph = graphs[activeIdx];

  return (
    <GlassCard padding="md" style={styles.card}>
      {/* Graph selector pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {graphs.map((g, i) => {
          const isActive = i === activeIdx;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => setActiveIdx(i)}
              style={[styles.pill, isActive && styles.pillActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {g.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Node → Edge → Node chain */}
      <View style={styles.chain}>
        {graph.nodes.map((node, i) => {
          const edge     = graph.edges[i];
          const nodeColor = NODE_TYPE_META[node.type]?.color ?? colors.brand.primary;
          const edgeMeta  = edge ? EDGE_TYPE_META[edge.edgeType] : null;

          return (
            <React.Fragment key={node.id}>
              <NodePill
                emoji={node.emoji}
                label={node.label}
                sublabel={node.sublabel}
                color={nodeColor}
                trustState={node.trustState}
                index={i}
              />
              {edge && edgeMeta && (
                <EdgeArrow
                  label={edgeMeta.verb}
                  color={edgeMeta.color}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Score row */}
      <View style={styles.scoreRow}>
        <View style={[styles.scorePill, {
          borderColor:     `${colors.trust[graph.score.trustState as TrustState]?.solid}50`,
          backgroundColor: `${colors.trust[graph.score.trustState as TrustState]?.solid}12`,
        }]}>
          <Text style={[styles.scoreNum, {
            color: colors.trust[graph.score.trustState as TrustState]?.solid,
          }]}>
            {graph.score.score}
          </Text>
          <Text style={styles.scoreLabel}>Trust Score</Text>
        </View>
        <Text style={styles.scoreDetail}>
          {graph.score.breakdown.nodeCount} nodes · {graph.score.breakdown.edgeCount} edges · {graph.score.label}
        </Text>
      </View>
    </GlassCard>
  );
};

// ── NodePill ──────────────────────────────────────────────────────────────────

const NodePill: React.FC<{
  emoji:      string;
  label:      string;
  sublabel?:  string;
  color:      string;
  trustState: string;
  index:      number;
}> = ({ emoji, label, sublabel, color, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1, speed: 14, bounciness: 7,
        delay: index * 120, useNativeDriver: true,
      }),
      Animated.timing(opAnim, {
        toValue: 1, duration: 280, delay: index * 120, useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opAnim, index]);

  return (
    <Animated.View
      style={[
        styles.nodeWrap,
        { opacity: opAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.nodeCircle, {
        borderColor:     color,
        backgroundColor: `${color}14`,
        shadowColor:     color,
      }]}>
        <Text style={styles.nodeEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.nodeLabel, { color }]}>{label}</Text>
      {sublabel && <Text style={styles.nodeSub}>{sublabel}</Text>}
    </Animated.View>
  );
};

// ── EdgeArrow ─────────────────────────────────────────────────────────────────

const EdgeArrow: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <View style={styles.edgeWrap}>
    <View style={[styles.edgeLine, { backgroundColor: `${color}40` }]} />
    <View style={[styles.edgeArrowHead, { borderLeftColor: color }]} />
    <Text style={[styles.edgeLabel, { color }]}>{label}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { marginBottom: 12 },

  // Graph pills
  pillScroll: { flexGrow: 0, marginBottom: 16 },
  pillRow:    { gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.border.subtle,
    backgroundColor:   colors.glass.subtle,
  },
  pillActive: {
    borderColor:     colors.brand.primary,
    backgroundColor: colors.brand.primaryDim,
  },
  pillText:       { ...typo.label, color: colors.text.tertiary },
  pillTextActive: { color: colors.brand.primary, fontWeight: '600' },

  // Chain
  chain: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    flexWrap:       'wrap',
    gap:            4,
    marginBottom:   16,
  },

  // Node
  nodeWrap: { alignItems: 'center', gap: 6, minWidth: 70 },
  nodeCircle: {
    width:         56,
    height:        56,
    borderRadius:  radius.full,
    borderWidth:   1.5,
    alignItems:    'center',
    justifyContent:'center',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius:  12,
  },
  nodeEmoji: { fontSize: 22 },
  nodeLabel: { ...typo.caption, fontWeight: '700', textAlign: 'center', fontSize: 10 },
  nodeSub:   { ...typo.caption, color: colors.text.quaternary, textAlign: 'center', fontSize: 9 },

  // Edge
  edgeWrap: {
    alignItems:  'center',
    gap:         3,
    paddingBottom: 22,
    minWidth:    44,
  },
  edgeLine: {
    height:      2,
    width:       32,
    borderRadius: radius.full,
  },
  edgeArrowHead: {
    width:           0,
    height:          0,
    borderTopWidth:  4,
    borderBottomWidth: 4,
    borderLeftWidth: 7,
    borderTopColor:  'transparent',
    borderBottomColor:'transparent',
    marginTop:       -6,
    marginLeft:      32,
  },
  edgeLabel: { ...typo.caption, fontSize: 8, fontWeight: '600' },

  // Score
  scoreRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    paddingTop:     12,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  scorePill: {
    flexDirection:     'row',
    alignItems:        'baseline',
    gap:               4,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  scoreNum:    { ...typo.headline, fontWeight: '800' },
  scoreLabel:  { ...typo.caption, color: colors.text.quaternary },
  scoreDetail: { ...typo.caption, color: colors.text.tertiary, flex: 1 },
});
