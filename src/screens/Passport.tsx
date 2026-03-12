import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

type Props = { navigation: any };

const DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const KEY_ID = 'did:key:z6Mk...#z6Mk...';

const CREDENTIALS = [
  { type: 'EmploymentCredential', issuer: 'Acme Corporation', issued: '2025-01-14', expires: '2026-01-14', status: 'Active' },
  { type: 'IdentityCredential', issuer: 'National Registry', issued: '2024-06-01', expires: '2029-06-01', status: 'Active' },
  { type: 'ProfessionalLicense', issuer: 'Licensing Board', issued: '2024-03-20', expires: '2025-03-20', status: 'Expired' },
];

export default function Passport({ navigation }: Props) {
  const [didVisible, setDidVisible] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Nav */}
        <View style={s.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
            <Text style={s.navBack}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={s.navTitle}>My Passport</Text>
          <View style={s.navSpacer} />
        </View>

        {/* Identity Card */}
        <View style={s.idCard}>
          <View style={s.idCardHeader}>
            <View style={s.idAvatar}>
              <Text style={s.idAvatarText}>ST</Text>
            </View>
            <View style={s.idCardMeta}>
              <Text style={s.idCardName}>Digital Identity</Text>
              <Text style={s.idCardOrg}>Sovereign Trust Network</Text>
              <View style={s.idCardBadge}>
                <View style={s.greenDot} />
                <Text style={s.idCardBadgeText}>Active · Verified</Text>
              </View>
            </View>
          </View>

          <View style={s.idCardDivider} />

          <View style={s.idCardRow}>
            <Text style={s.idCardFieldKey}>ISSUED BY</Text>
            <Text style={s.idCardFieldVal}>Sovereign Trust Authority</Text>
          </View>
          <View style={s.idCardRow}>
            <Text style={s.idCardFieldKey}>VALID THROUGH</Text>
            <Text style={s.idCardFieldVal}>January 14, 2027</Text>
          </View>
          <View style={s.idCardRow}>
            <Text style={s.idCardFieldKey}>SCHEME</Text>
            <Text style={s.idCardFieldVal}>W3C Verifiable Credentials 2.0</Text>
          </View>

          {/* Security Badges */}
          <View style={s.securityRow}>
            {['Face ID', 'Secure Enclave', 'Hardware Key'].map((badge) => (
              <View key={badge} style={s.secBadge}>
                <Text style={s.secBadgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* DID Section */}
        <Text style={s.sectionLabel}>DECENTRALIZED IDENTIFIER</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <Text style={s.fieldKey}>DID</Text>
            <Text
              style={[s.fieldVal, s.mono]}
              numberOfLines={didVisible ? undefined : 1}
              ellipsizeMode="middle"
            >
              {DID}
            </Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.fieldRow}>
            <Text style={s.fieldKey}>KEY ID</Text>
            <Text
              style={[s.fieldVal, s.mono]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {KEY_ID}
            </Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.fieldRow}>
            <Text style={s.fieldKey}>KEY TYPE</Text>
            <Text style={s.fieldVal}>P-256 · Secure Enclave · Hardware-bound</Text>
          </View>
          <View style={s.rowDivider} />
          <TouchableOpacity
            style={s.didToggle}
            onPress={() => setDidVisible((v) => !v)}
            activeOpacity={0.6}
          >
            <Text style={s.didToggleText}>
              {didVisible ? 'Hide full DID' : 'Show full DID'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Credentials */}
        <Text style={s.sectionLabel}>HELD CREDENTIALS</Text>
        <View style={s.credentialList}>
          {CREDENTIALS.map((cred, i) => (
            <View key={cred.type}>
              <View style={s.credRow}>
                <View style={s.credLeft}>
                  <View style={s.credTypeRow}>
                    <Text style={s.credType}>{cred.type}</Text>
                    <View
                      style={[
                        s.credStatusPill,
                        cred.status === 'Expired' && s.credStatusExpired,
                      ]}
                    >
                      <Text
                        style={[
                          s.credStatusText,
                          cred.status === 'Expired' && s.credStatusTextExpired,
                        ]}
                      >
                        {cred.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.credIssuer}>{cred.issuer}</Text>
                  <Text style={s.credDate}>
                    {cred.issued} → {cred.expires}
                  </Text>
                </View>
                <Text style={s.credChevron}>›</Text>
              </View>
              {i < CREDENTIALS.length - 1 && <View style={s.rowDivider} />}
            </View>
          ))}
        </View>

        {/* Proof */}
        <Text style={s.sectionLabel}>CRYPTOGRAPHIC PROOF</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <Text style={s.fieldKey}>SIGNATURE TYPE</Text>
            <Text style={s.fieldVal}>Ed25519Signature2020</Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.fieldRow}>
            <Text style={s.fieldKey}>PROOF PURPOSE</Text>
            <Text style={s.fieldVal}>assertionMethod</Text>
          </View>
          <View style={s.rowDivider} />
          <View style={s.fieldRow}>
            <Text style={s.fieldKey}>SELECTIVE DISCLOSURE</Text>
            <Text style={s.fieldVal}>BBS+ · Zero-Knowledge Proofs</Text>
          </View>
        </View>

        <Text style={s.footerNote}>
          Your private key is bound to this device's Secure Enclave and cannot
          be exported or transferred.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingBottom: 48 },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  navBack: { fontSize: 17, color: '#007AFF', fontWeight: '400', width: 60 },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  navSpacer: { width: 60 },
  idCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 20,
    borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  idCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  idAvatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  idAvatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  idCardMeta: { flex: 1 },
  idCardName: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  idCardOrg: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  idCardBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  greenDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#34C759' },
  idCardBadgeText: { fontSize: 12, color: '#34C759', fontWeight: '600' },
  idCardDivider: {
    height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginBottom: 14,
  },
  idCardRow: { marginBottom: 10 },
  idCardFieldKey: { fontSize: 10, fontWeight: '600', color: '#AEAEB2', letterSpacing: 0.5, marginBottom: 2 },
  idCardFieldVal: { fontSize: 14, color: '#1C1C1E', fontWeight: '400' },
  securityRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  secBadge: {
    backgroundColor: '#F2F2F7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  secBadgeText: { fontSize: 11, fontWeight: '600', color: '#3C3C43' },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.7,
    marginTop: 28, marginBottom: 8, marginHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden',
  },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 11 },
  fieldKey: { fontSize: 10, fontWeight: '600', color: '#AEAEB2', letterSpacing: 0.5, marginBottom: 3 },
  fieldVal: { fontSize: 14, color: '#1C1C1E' },
  mono: { fontFamily: 'Menlo', fontSize: 12, color: '#3C3C43' },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#F2F2F7', marginLeft: 16 },
  didToggle: { paddingHorizontal: 16, paddingVertical: 12 },
  didToggleText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  credentialList: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden',
  },
  credRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  credLeft: { flex: 1 },
  credTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  credType: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  credStatusPill: {
    backgroundColor: '#F0FFF4', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  credStatusExpired: { backgroundColor: '#FFF5F5' },
  credStatusText: { fontSize: 11, fontWeight: '600', color: '#34C759' },
  credStatusTextExpired: { color: '#FF3B30' },
  credIssuer: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  credDate: { fontSize: 12, color: '#AEAEB2', fontFamily: 'Menlo' },
  credChevron: { fontSize: 20, color: '#C7C7CC', lineHeight: 24 },
  footerNote: {
    fontSize: 11, color: '#AEAEB2', textAlign: 'center', lineHeight: 16,
    paddingHorizontal: 32, marginTop: 28,
  },
});