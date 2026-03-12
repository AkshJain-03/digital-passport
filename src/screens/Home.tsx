import React from 'react';
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

const ACTIONS = [
  {
    screen: 'Passport',
    label: 'My Passport',
    description: 'View your verified digital identity',
    tag: 'Identity',
  },
  {
    screen: 'Scan',
    label: 'Scan & Verify',
    description: 'Verify a credential or presentation',
    tag: 'Verification',
  },
  {
    screen: 'Handshake',
    label: 'Trust Handshake',
    description: 'Authenticate or transfer custody',
    tag: 'Authentication',
  },
  {
    screen: 'TruthFeed',
    label: 'Truth Feed',
    description: 'Browse cryptographically signed posts',
    tag: 'Feed',
  },
];

export default function Home({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoMark}>
            <View style={s.logoInner} />
          </View>
          <Text style={s.appName}>Sovereign Trust</Text>
          <Text style={s.tagline}>Your hardware-secured digital passport</Text>
        </View>

        {/* Trust Indicators */}
        <View style={s.trustBar}>
          {['Face ID', 'Secure Enclave', 'W3C VC 2.0'].map((label) => (
            <View key={label} style={s.trustChip}>
              <View style={s.trustDot} />
              <Text style={s.trustLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Explanation Card */}
        <View style={s.explainCard}>
          <Text style={s.explainTitle}>What is this?</Text>
          <Text style={s.explainBody}>
            Sovereign Trust Passport stores your digital identity in hardware,
            protected by Face ID. Issue, hold, and present verifiable credentials
            — without ever exposing your private key or revealing unnecessary
            personal data.
          </Text>
        </View>

        {/* Section Label */}
        <Text style={s.sectionLabel}>FEATURES</Text>

        {/* Action Cards */}
        <View style={s.cardList}>
          {ACTIONS.map((action, index) => (
            <TouchableOpacity
              key={action.screen}
              style={[s.actionCard, index === ACTIONS.length - 1 && s.actionCardLast]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.6}
            >
              <View style={s.actionLeft}>
                <Text style={s.actionLabel}>{action.label}</Text>
                <Text style={s.actionDescription}>{action.description}</Text>
              </View>
              <View style={s.actionRight}>
                <View style={s.tagPill}>
                  <Text style={s.tagText}>{action.tag}</Text>
                </View>
                <Text style={s.actionChevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text style={s.footerNote}>
          Private keys never leave the Secure Enclave. All operations require
          explicit biometric confirmation.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    paddingBottom: 48,
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  logoInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  trustBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  trustLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3C3C43',
    letterSpacing: 0.1,
  },
  explainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  explainTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  explainBody: {
    fontSize: 14,
    color: '#6C6C70',
    lineHeight: 21,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.7,
    marginTop: 28,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  cardList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
  },
  actionCardLast: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  actionDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagPill: {
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6C6C70',
  },
  actionChevron: {
    fontSize: 20,
    color: '#C7C7CC',
    lineHeight: 24,
  },
  footerNote: {
    fontSize: 11,
    color: '#AEAEB2',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 32,
    marginTop: 28,
  },
});