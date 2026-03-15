/**
 * TruthFeedScreen
 *
 * Social post feed where every post shows:
 *   • Author avatar (emoji) + name + institution
 *   • Author trust badge (verified / unverified / suspicious)
 *   • Post content
 *   • Claim verification ratio bar
 *   • 3-layer progressive reveal: content → author DID → fraud signals
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors }              from '../../theme/colors';
import { radius }              from '../../theme/radius';
import { spacing }             from '../../theme/spacing';
import { typography }          from '../../theme/typography';
import { shadows }             from '../../theme/shadows';
import { AppBadge }            from '../../components/common/AppBadge';
import { AppSectionTitle }     from '../../components/common/AppSectionTitle';
import { GlassCard }           from '../../components/common/GlassCard';
import { EmptyState }          from '../../components/common/EmptyState';
import { LoadingState }        from '../../components/common/LoadingState';
import { useTruthFeed, type FeedFilter } from '../../hooks/useTruthFeed';
import { formatRelative }      from '../../utils/formatters';
import type { Post }           from '../../models/post';
import type { TrustState }     from '../../theme/colors';

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'verified',   label: 'Verified' },
  { key: 'suspicious', label: 'Suspicious' },
  { key: 'unverified', label: 'Unverified' },
];

export const TruthFeedScreen: React.FC = () => {
  const { posts, isLoading, error, filter, setFilter, refresh, verifyPost } = useTruthFeed();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Truth Feed</Text>
        <Text style={styles.sub}>Verified news and social claims</Text>
      </View>

      {/* Filter bar */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Body */}
      {isLoading ? (
        <LoadingState message="Loading feed…" />
      ) : error ? (
        <EmptyState icon="⚠" title="Couldn't load feed" description={error} glowState="suspicious" />
      ) : posts.length === 0 ? (
        <EmptyState icon="⊕" title="No posts" description="Nothing matched this filter." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}
              tintColor={colors.brand.primary} colors={[colors.brand.primary]} />
          }
        >
          <AppSectionTitle title="Posts" count={posts.length} style={styles.sectionTitle} />
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onVerify={verifyPost} />
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
};

// ─── Post card ────────────────────────────────────────────────────────────────

const PostCard: React.FC<{
  post:     Post;
  index:    number;
  onVerify: (id: string) => Promise<void>;
}> = ({ post, index, onVerify }) => {
  const [tapLayer, setTapLayer] = React.useState(0);
  const [verifying, setVerifying] = React.useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 380, delay: index * 80, useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    await onVerify(post.id);
    setVerifying(false);
  }, [onVerify, post.id]);

  const claimRatio = post.claimCount > 0
    ? post.verifiedClaimCount / post.claimCount
    : 1;

  const trustColor = colors.trust[post.trustState as TrustState]?.solid ?? colors.brand.primary;

  return (
    <Animated.View style={{
      opacity:   anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
    }}>
      <GlassCard
        glowState={post.trustState as TrustState}
        padding="md"
        revealLayers={3}
        onTapLayer={setTapLayer}
        style={styles.postCard}
      >
        {/* Author row */}
        <View style={styles.authorRow}>
          <View style={[styles.avatar, { borderColor: trustColor + '50' }]}>
            <Text style={styles.avatarEmoji}>{post.author.avatarEmoji}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author.displayName}</Text>
            <Text style={styles.authorHandle}>{post.author.handle}</Text>
          </View>
          <AppBadge
            label={post.trustState}
            variant={post.trustState as TrustState}
            dot size="sm"
          />
        </View>

        {/* Content */}
        <Text style={styles.content}>{post.content}</Text>

        {/* Claim bar */}
        {post.claimCount > 0 && (
          <View style={styles.claimBarWrap}>
            <View style={styles.claimBarTrack}>
              <View style={[styles.claimBarFill, {
                width:           `${Math.round(claimRatio * 100)}%` as any,
                backgroundColor: claimRatio >= 0.8 ? colors.trust.verified.solid :
                                  claimRatio >= 0.5 ? colors.trust.pending.solid :
                                  colors.trust.suspicious.solid,
              }]} />
            </View>
            <Text style={styles.claimLabel}>
              {post.verifiedClaimCount}/{post.claimCount} claims verified
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.postFooter}>
          <Text style={styles.timestamp}>{formatRelative(post.publishedAt)}</Text>
          {post.sourceName && (
            <Text style={styles.source}>{post.sourceName}</Text>
          )}
          <TouchableOpacity onPress={handleVerify} disabled={verifying} activeOpacity={0.7}>
            <Text style={[styles.verifyAction, { color: trustColor }]}>
              {verifying ? 'Checking…' : 'Verify'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Layer 1: author DID */}
        {tapLayer >= 1 && (
          <View style={styles.layer}>
            <View style={styles.layerDivider} />
            <Text style={styles.layerLabel}>AUTHOR IDENTITY</Text>
            <Text style={styles.layerMono}>{post.author.did}</Text>
            {post.author.institution && (
              <Text style={styles.layerDetail}>{post.author.institution}</Text>
            )}
          </View>
        )}

        {/* Layer 2: fraud signals / tags */}
        {tapLayer >= 2 && (
          <View style={styles.layer}>
            <View style={styles.layerDivider} />
            <Text style={styles.layerLabel}>TAGS</Text>
            <View style={styles.tagsRow}>
              {post.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg.base, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { paddingHorizontal: spacing[4], marginBottom: spacing[3] },
  title:  { ...typography.title2, color: colors.text.primary },
  sub:    { ...typography.bodySm, color: colors.text.tertiary, marginTop: 3 },

  filterBar:    { flexGrow: 0, marginBottom: spacing[3] },
  filterScroll: { paddingHorizontal: spacing[4], gap: spacing[2] },
  filterChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1] + 2,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border.subtle,
    backgroundColor: colors.glass.light,
  },
  filterChipActive:  { backgroundColor: colors.brand.primaryDim, borderColor: colors.brand.primary },
  filterLabel:       { ...typography.buttonSm, color: colors.text.tertiary },
  filterLabelActive: { color: colors.brand.primary },

  feed:         { paddingHorizontal: spacing[4] },
  sectionTitle: { paddingHorizontal: 0, marginBottom: spacing[2] },
  postCard:     { marginBottom: spacing[3] },

  authorRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  avatar: {
    width: 40, height: 40, borderRadius: radius.full, borderWidth: 1.5,
    backgroundColor: colors.glass.medium, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:  { fontSize: 20 },
  authorInfo:   { flex: 1 },
  authorName:   { ...typography.headlineSm, color: colors.text.primary },
  authorHandle: { ...typography.captionSm,  color: colors.text.tertiary, marginTop: 1 },

  content: { ...typography.body, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing[3] },

  claimBarWrap:  { marginBottom: spacing[3] },
  claimBarTrack: {
    height: 3, borderRadius: 2, backgroundColor: colors.glass.heavy,
    overflow: 'hidden', marginBottom: 4,
  },
  claimBarFill:  { height: '100%', borderRadius: 2 },
  claimLabel:    { ...typography.captionSm, color: colors.text.quaternary },

  postFooter:    { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  timestamp:     { ...typography.captionSm, color: colors.text.quaternary, flex: 1 },
  source:        { ...typography.captionSm, color: colors.text.tertiary },
  verifyAction:  { ...typography.buttonXs },

  layer:         { marginTop: spacing[2] },
  layerDivider:  { height: 1, backgroundColor: colors.border.subtle, marginBottom: spacing[2] },
  layerLabel:    { ...typography.label, color: colors.text.quaternary, marginBottom: spacing[1] },
  layerMono:     { ...typography.mono, color: colors.text.tertiary, fontSize: 10 },
  layerDetail:   { ...typography.captionSm, color: colors.text.secondary, marginTop: 3 },
  tagsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    paddingHorizontal: spacing[2], paddingVertical: 2,
    backgroundColor: colors.glass.medium, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border.subtle,
  },
  tagText: { ...typography.captionSm, color: colors.text.tertiary },
});

export default TruthFeedScreen;