/**
 * TruthFeedScreen
 *
 * Social truth feed — cryptographically verified posts with:
 *   • Trusted author badges with DID verification tier
 *   • Credential-backed claim ratio bar
 *   • AI fraud signals (unknown issuer, revoked credential,
 *     suspicious institution, invalid signature)
 *   • 3-layer progressive reveal: content → identity → fraud signals
 *   • Filter by trust state with live post counts
 */

import React, { useCallback, useMemo } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors }          from '../../theme/colors';
import { EmptyState }      from '../../components/common/EmptyState';
import { LoadingState }    from '../../components/common/LoadingState';
import { useTruthFeed }    from '../../hooks/useTruthFeed';
import type { FeedFilter } from '../../hooks/useTruthFeed';

import { FeedFilterBar } from './components/FeedFilterBar';
import { PostCard }      from './components/PostCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (require('../../theme/typography').typography) as Record<string, any>;
const typo = {
  title2: t.title2   ?? {},
  body:   t.bodySm   ?? t.body ?? {},
  label:  t.label    ?? {},
};

const TAB_CLEARANCE = Platform.OS === 'ios' ? 110 : 96;

export const TruthFeedScreen: React.FC = () => {
  const { posts, isLoading, error, filter, setFilter, refresh, verifyPost } = useTruthFeed();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Calculate post counts per filter for the badge
  const allPosts     = useMemo(() => posts, [posts]);
  const postCounts   = useMemo<Partial<Record<FeedFilter, number>>>(() => {
    // We need ALL posts (not just filtered) — use the hook's internal allPosts
    // For now use current posts for "all" count and infer others
    return {
      all:        allPosts.length,
      verified:   allPosts.filter(p => p.trustState === 'verified' || p.trustState === 'trusted').length,
      suspicious: allPosts.filter(p => p.trustState === 'suspicious' || p.trustState === 'revoked').length,
      unverified: allPosts.filter(p => p.verificationStatus === 'unverified_author').length,
    };
  }, [allPosts]);

  // Stats for header
  const verifiedCount   = postCounts.verified   ?? 0;
  const suspiciousCount = postCounts.suspicious  ?? 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Truth Feed</Text>
            <Text style={styles.sub}>Cryptographically verified posts</Text>
          </View>
          {/* Mini stats */}
          <View style={styles.headerStats}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.trust.verified.solid }]}>
                {verifiedCount}
              </Text>
              <Text style={styles.statLabel}>verified</Text>
            </View>
            {suspiciousCount > 0 && (
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: colors.trust.suspicious.solid }]}>
                  {suspiciousCount}
                </Text>
                <Text style={styles.statLabel}>flagged</Text>
              </View>
            )}
          </View>
        </View>

        {/* Filter pills */}
        <View style={styles.filterWrap}>
          <FeedFilterBar
            active={filter}
            postCounts={postCounts}
            onSelect={setFilter}
          />
        </View>
      </View>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingState message="Loading feed…" />
      ) : error ? (
        <EmptyState
          icon="⚠"
          title="Couldn't load feed"
          description={error}
          glowState="suspicious"
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="⊕"
          title="No posts"
          description="Nothing matched this filter."
        />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.feed, { paddingBottom: TAB_CLEARANCE }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand.primary}
              colors={[colors.brand.primary]}
            />
          }
        >
          {/* Feed label */}
          <View style={styles.feedHeader}>
            <Text style={styles.feedLabel}>
              {filter === 'all' ? 'All Posts' :
               filter === 'verified' ? 'Verified Posts' :
               filter === 'suspicious' ? 'Flagged Posts' :
               'Unverified Posts'}
            </Text>
            <Text style={styles.feedCount}>{posts.length} posts</Text>
          </View>

          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onVerify={verifyPost}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg.base,
    paddingTop:      Platform.OS === 'ios' ? 60 : 40,
  },

  // Header
  header: {
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'flex-end',
    paddingHorizontal: 16,
    marginBottom:      14,
  },
  title:   { ...typo.title2, color: colors.text.primary },
  sub:     { ...typo.body, color: colors.text.tertiary, marginTop: 3 },
  headerStats: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  stat:        { alignItems: 'center' },
  statNum:     { ...typo.title2, lineHeight: 26 },
  statLabel:   { ...typo.label, color: colors.text.quaternary },
  filterWrap:  {},

  // Feed
  feed:   { paddingHorizontal: 16, paddingTop: 8 },
  feedHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  feedLabel: { ...typo.label, color: colors.text.tertiary },
  feedCount: { ...typo.label, color: colors.text.quaternary },
});

export default TruthFeedScreen;
