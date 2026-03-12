import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';

type FilterTab = 'all' | 'verified' | 'unverified';

type Post = {
  id: string;
  author: string;
  did: string;
  handle: string;
  body: string;
  timestamp: string;
  verified: boolean;
  issuer?: string;
  credentialType?: string;
  topic: string;
};

const POSTS: Post[] = [
  {
    id: '1',
    author: 'Dr. Elena Vasquez',
    did: 'did:key:z6MkvaS...9f2A',
    handle: '@vasquez.research',
    body: 'Hardware attestation reduces credential phishing by 94% in enterprise environments. We published the full methodology and dataset at our lab page.',
    timestamp: '3 min ago',
    verified: true,
    issuer: 'Stanford Research Institute',
    credentialType: 'AcademicCredential',
    topic: 'Research',
  },
  {
    id: '2',
    author: 'anonymous_node',
    did: 'unresolved',
    handle: '@node_anon',
    body: 'Pretty sure this whole "hardware key" thing is just marketing. Standard OAuth is fine for everything.',
    timestamp: '18 min ago',
    verified: false,
    topic: 'Opinion',
  },
  {
    id: '3',
    author: 'Marcus Chen',
    did: 'did:key:z6MkR11...c03D',
    handle: '@mchen.logistics',
    body: 'Completed our third supply chain handoff using Sovereign Trust today. Customs inspection took 4 minutes instead of 4 hours — the cryptographic audit trail is accepted directly.',
    timestamp: '42 min ago',
    verified: true,
    issuer: 'TrustChain Logistics Ltd.',
    credentialType: 'SupplyChainCredential',
    topic: 'Operations',
  },
  {
    id: '4',
    author: 'Policy Monitor',
    did: 'did:key:z6MkPol...9Wq2',
    handle: '@policymonitor',
    body: 'Draft regulation published: all government-issued verifiable credentials must include hardware attestation proofs starting Q1 2026. Public comment period open through December.',
    timestamp: '1 hr ago',
    verified: true,
    issuer: 'Digital Policy Foundation',
    credentialType: 'OrganizationCredential',
    topic: 'Regulation',
  },
  {
    id: '5',
    author: 'CredFarm_Bot',
    did: 'unresolved',
    handle: '@credfarm_service',
    body: 'Generate 100 verified credentials for $19.99. All schema types supported. Instant delivery.',
    timestamp: '2 hr ago',
    verified: false,
    topic: 'Spam',
  },
  {
    id: '6',
    author: 'Amara Osei',
    did: 'did:key:z6MkA77...oTr9',
    handle: '@amara.osei',
    body: 'Passed my engineering certification renewal without a single phone call. Verifier resolved my credential in under 3 seconds. This is what the W3C VC spec was meant for.',
    timestamp: '3 hr ago',
    verified: true,
    issuer: 'Professional Certification Board',
    credentialType: 'ProfessionalLicense',
    topic: 'Use Case',
  },
  {
    id: '7',
    author: 'Kai Nakamura',
    did: 'did:key:z6MkKai...82Xp',
    handle: '@knakamura.dev',
    body: 'Interesting edge case: what happens to a DID-based credential when a hardware device is physically destroyed? The spec allows for key recovery via pre-registered backup DID — worth documenting.',
    timestamp: '5 hr ago',
    verified: true,
    issuer: 'W3C Contributor Registry',
    credentialType: 'DeveloperCredential',
    topic: 'Technical',
  },
  {
    id: '8',
    author: 'unknown_poster',
    did: 'unresolved',
    handle: '@unknown_12983',
    body: 'I work at a major bank and we are NOT adopting any of this. Too complex for average users.',
    timestamp: '8 hr ago',
    verified: false,
    topic: 'Opinion',
  },
];

type Props = { navigation: any };

function PostCard({ post, onVerify }: { post: Post; onVerify: () => void }) {
  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.cardHeader}>
        <View style={s.avatarWrap}>
          <Text style={s.avatarText}>
            {post.author[0].toUpperCase()}
          </Text>
        </View>
        <View style={s.authorBlock}>
          <View style={s.authorTopRow}>
            <Text style={s.authorName} numberOfLines={1}>{post.author}</Text>
            {post.verified ? (
              <View style={s.verifiedBadge}>
                <View style={s.verifiedDot} />
                <Text style={s.verifiedBadgeText}>Verified</Text>
              </View>
            ) : (
              <View style={s.unverifiedBadge}>
                <Text style={s.unverifiedBadgeText}>Unverified</Text>
              </View>
            )}
          </View>
          <Text style={s.authorHandle} numberOfLines={1}>{post.handle}</Text>
        </View>
        <View style={s.cardMeta}>
          <Text style={s.timestamp}>{post.timestamp}</Text>
          <View style={s.topicPill}>
            <Text style={s.topicText}>{post.topic}</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <Text style={s.postBody}>{post.body}</Text>

      {/* Credential Strip */}
      {post.verified && post.issuer && (
        <View style={s.credStrip}>
          <View style={s.credStripLeft}>
            <Text style={s.credStripType}>{post.credentialType}</Text>
            <Text style={s.credStripIssuer}>{post.issuer}</Text>
          </View>
          <TouchableOpacity
            onPress={onVerify}
            activeOpacity={0.6}
            style={s.credStripAction}
          >
            <Text style={s.credStripActionText}>Verify</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Unverified Strip */}
      {!post.verified && (
        <View style={s.warnStrip}>
          <Text style={s.warnText}>
            No credential attached — identity unverifiable
          </Text>
        </View>
      )}

      {/* DID Footer */}
      <View style={s.didFooter}>
        <Text style={s.didText} numberOfLines={1}>
          {post.did}
        </Text>
      </View>
    </View>
  );
}

export default function TruthFeed({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = POSTS.filter((p) => {
    if (filter === 'verified')   return p.verified;
    if (filter === 'unverified') return !p.verified;
    return true;
  });

  const verifiedCount   = POSTS.filter((p) => p.verified).length;
  const unverifiedCount = POSTS.filter((p) => !p.verified).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Nav */}
      <View style={s.navRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Text style={s.navBack}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Truth Feed</Text>
        <View style={s.navSpacer} />
      </View>

      {/* Stats Bar */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statCount}>{verifiedCount}</Text>
          <Text style={s.statLabel}>Verified</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statCount}>{unverifiedCount}</Text>
          <Text style={s.statLabel}>Unverified</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statCount}>{POSTS.length}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={s.filterRow}>
        {(['all', 'verified', 'unverified'] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.filterTab, filter === tab && s.filterTabActive]}
            onPress={() => setFilter(tab)}
            activeOpacity={0.6}
          >
            <Text
              style={[s.filterTabText, filter === tab && s.filterTabTextActive]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.feedList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.itemSep} />}
        ListHeaderComponent={() => (
          <Text style={s.feedCount}>
            Showing {filtered.length} post{filtered.length !== 1 ? 's' : ''}
          </Text>
        )}
        ListFooterComponent={() => (
          <Text style={s.feedFooter}>
            Verified posts are cryptographically attested. Unverified posts
            carry no identity guarantee.
          </Text>
        )}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onVerify={() => navigation.navigate('Verify')}
          />
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  navBack: { fontSize: 17, color: '#007AFF', fontWeight: '400', width: 60 },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  navSpacer: { width: 60 },
  statsBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA',
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statCount: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  statLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA' },
  filterRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16,
    paddingVertical: 10, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterTabActive: { backgroundColor: '#1C1C1E' },
  filterTabText: { fontSize: 13, fontWeight: '500', color: '#6C6C70' },
  filterTabTextActive: { color: '#FFFFFF' },
  feedList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48 },
  feedCount: {
    fontSize: 11, color: '#AEAEB2', fontWeight: '500',
    letterSpacing: 0.3, marginBottom: 10, marginLeft: 4,
  },
  feedFooter: {
    fontSize: 11, color: '#AEAEB2', textAlign: 'center',
    lineHeight: 16, marginTop: 20, paddingHorizontal: 16,
  },
  itemSep: { height: 10 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatarWrap: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
  },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  authorBlock: { flex: 1 },
  authorTopRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' },
  authorName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FFF4', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  verifiedDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#34C759' },
  verifiedBadgeText: { fontSize: 10, fontWeight: '700', color: '#1E6B3C', letterSpacing: 0.3 },
  unverifiedBadge: {
    backgroundColor: '#F9F9F9', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: '#E5E5EA',
  },
  unverifiedBadgeText: { fontSize: 10, fontWeight: '600', color: '#AEAEB2', letterSpacing: 0.3 },
  authorHandle: { fontSize: 12, color: '#8E8E93' },
  cardMeta: { alignItems: 'flex-end', gap: 5 },
  timestamp: { fontSize: 11, color: '#AEAEB2' },
  topicPill: {
    backgroundColor: '#F2F2F7', borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  topicText: { fontSize: 10, fontWeight: '500', color: '#8E8E93' },
  postBody: { fontSize: 15, color: '#1C1C1E', lineHeight: 22, marginBottom: 12 },
  credStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FFF4', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#C3F0D0',
  },
  credStripLeft: { flex: 1 },
  credStripType: { fontSize: 12, fontWeight: '600', color: '#1E6B3C', marginBottom: 1 },
  credStripIssuer: { fontSize: 11, color: '#3C8C5C' },
  credStripAction: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#FFFFFF', borderRadius: 8,
    borderWidth: 1, borderColor: '#C3F0D0',
  },
  credStripActionText: { fontSize: 12, fontWeight: '600', color: '#1E6B3C' },
  warnStrip: {
    backgroundColor: '#FFF5F5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 10,
    borderWidth: 1, borderColor: '#FFD5D5',
  },
  warnText: { fontSize: 12, fontWeight: '500', color: '#C0392B' },
  didFooter: {
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F2F2F7', paddingTop: 8,
  },
  didText: { fontSize: 10, color: '#C7C7CC', fontFamily: 'Menlo' },
});