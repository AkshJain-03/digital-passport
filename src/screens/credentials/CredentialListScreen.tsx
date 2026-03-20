/**
 * CredentialListScreen  (src/screens/credentials)
 *
 * The credential wallet — lists all credentials with:
 *   • Animated stagger on load
 *   • Filter bar (All / Active / Pending / Revoked / Expired)
 *   • Each card supports 3-layer progressive tap reveal
 *   • Share QR sheet
 *   • Full detail sheet with live verification
 *   • Empty state
 */

import React, { useCallback, useMemo, useState } from 'react';
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

import { colors }                     from '../../theme/colors';
import { spacing }                    from '../../theme/spacing';
import { typography }                 from '../../theme/typography';
import { AppSectionTitle }            from '../../components/common/AppSectionTitle';
import { EmptyState }                 from '../../components/common/EmptyState';
import { LoadingState }               from '../../components/common/LoadingState';
import { useCredentialStore }         from '../../hooks/useCredentialStore';
import type { CredentialWithIssuer }  from '../../models/credential';

import { CredentialFilterBar }        from './components/CredentialFilterBar';
import { CredentialCard }             from './components/CredentialCard';
import { CredentialQRSheet }          from './components/CredentialQRSheet';
import { CredentialDetailSheet }      from './components/CredentialDetailSheet';
import type { CredentialFilter }      from './components/CredentialFilterBar';

const TAB_CLEARANCE = Platform.OS === 'ios' ? 128 : 112;

export const CredentialListScreen: React.FC = () => {
  const {
    credentials,
    isLoading,
    error,
    refresh,
    verify,
    remove,
  } = useCredentialStore();

  const [activeFilter, setActiveFilter] = useState<CredentialFilter>('all');
  const [qrTarget,     setQrTarget]     = useState<CredentialWithIssuer | null>(null);
  const [detailTarget, setDetailTarget] = useState<CredentialWithIssuer | null>(null);
  const [qrVisible,    setQrVisible]    = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return credentials;
    return credentials.filter(c => c.status === activeFilter);
  }, [credentials, activeFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleShare = useCallback((cred: CredentialWithIssuer) => {
    setQrTarget(cred);
    setQrVisible(true);
  }, []);

  const handleCardPress = useCallback((cred: CredentialWithIssuer) => {
    setDetailTarget(cred);
    setDetailVisible(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.base} />

      {/* Page header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Credential Wallet</Text>
        <Text style={styles.pageSub}>Your verifiable credentials</Text>
      </View>

      {/* Filter bar */}
      <CredentialFilterBar active={activeFilter} onChange={setActiveFilter} />

      {/* Body */}
      {isLoading ? (
        <LoadingState message="Loading credentials…" />
      ) : error ? (
        <EmptyState
          icon="⚠"
          title="Couldn't load credentials"
          description={error}
          actionLabel="Retry"
          onAction={refresh}
          glowState="suspicious"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="◈"
          title={activeFilter === 'all' ? 'No credentials yet' : `No ${activeFilter} credentials`}
          description={
            activeFilter === 'all'
              ? 'Scan a credential QR code to add your first credential.'
              : `You have no credentials with status "${activeFilter}".`
          }
          actionLabel={activeFilter !== 'all' ? 'Show all' : undefined}
          onAction={activeFilter !== 'all' ? () => setActiveFilter('all') : undefined}
        />
      ) : (
        <AnimatedCredentialList
          credentials={filtered}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onCardPress={handleCardPress}
          onShare={handleShare}
        />
      )}

      {/* QR sharing sheet */}
      <CredentialQRSheet
        credential={qrTarget}
        visible={qrVisible}
        onDismiss={() => setQrVisible(false)}
      />

      {/* Detail sheet */}
      <CredentialDetailSheet
        credential={detailTarget}
        visible={detailVisible}
        onDismiss={() => setDetailVisible(false)}
        onVerify={verify}
        onShare={cred => {
          setDetailVisible(false);
          setTimeout(() => { setQrTarget(cred); setQrVisible(true); }, 350);
        }}
        onDelete={id => { remove(id); setDetailVisible(false); }}
      />
    </View>
  );
};

// ── Animated list with stagger ─────────────────────────────────────────────────

const AnimatedCredentialList: React.FC<{
  credentials: CredentialWithIssuer[];
  refreshing:  boolean;
  onRefresh:   () => void;
  onCardPress: (c: CredentialWithIssuer) => void;
  onShare:     (c: CredentialWithIssuer) => void;
}> = ({ credentials, refreshing, onRefresh, onCardPress, onShare }) => (
  <ScrollView
    contentContainerStyle={[styles.list, { paddingBottom: TAB_CLEARANCE }]}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.brand.primary}
        colors={[colors.brand.primary]}
      />
    }
  >
    <AppSectionTitle
      title="Credentials"
      count={credentials.length}
      style={styles.listTitle}
    />
    {credentials.map((cred, index) => (
      <StaggeredCard
        key={cred.id}
        cred={cred}
        index={index}
        onPress={onCardPress}
        onShare={onShare}
      />
    ))}
  </ScrollView>
);

// ── Single staggered card ──────────────────────────────────────────────────────

const StaggeredCard: React.FC<{
  cred:    CredentialWithIssuer;
  index:   number;
  onPress: (c: CredentialWithIssuer) => void;
  onShare: (c: CredentialWithIssuer) => void;
}> = React.memo(({ cred, index, onPress, onShare }) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue:  1,
      duration: 380,
      delay:    index * 60,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={{
        opacity:   anim,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
        }],
      }}
    >
      <CredentialCard
        credential={cred}
        onPress={() => onPress(cred)}
        onShare={onShare}
      />
    </Animated.View>
  );
});

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: 'transparent',
    paddingTop:      Platform.OS === 'ios' ? 66 : 46,
  },
  header: {
    paddingHorizontal: spacing[5],
    marginBottom:      spacing[5],
  },
  pageTitle: { ...typography.title1, color: colors.text.primary },
  pageSub:   { ...typography.captionSm, color: colors.text.tertiary, marginTop: 3 },
  list: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[4],
    gap:               spacing[4],
  },
  listTitle: {
    paddingHorizontal: 0,
    marginBottom:      spacing[2],
  },
});

export default CredentialListScreen;
