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

type VerifyPhase = 'idle' | 'pending' | 'success' | 'failure';

type Props = { navigation: any };

const CREDENTIAL = {
  type: 'EmploymentCredential',
  subject: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  issuer: 'did:web:credentials.acmecorp.com',
  issued: '2025-01-14',
  expires: '2026-01-14',
  signature: 'Ed25519Signature2020',
  revocationStatus: 'Not revoked',
};

const STEPS_SUCCESS = [
  { label: 'Parse credential envelope', status: 'pass' },
  { label: 'Resolve issuer DID document', status: 'pass' },
  { label: 'Verify Ed25519 signature', status: 'pass' },
  { label: 'Check revocation registry', status: 'pass' },
  { label: 'Validate expiration date', status: 'pass' },
];

const STEPS_FAILURE = [
  { label: 'Parse credential envelope', status: 'pass' },
  { label: 'Resolve issuer DID document', status: 'pass' },
  { label: 'Verify Ed25519 signature', status: 'fail' },
  { label: 'Check revocation registry', status: 'skip' },
  { label: 'Validate expiration date', status: 'skip' },
];

export default function Verify({ navigation }: Props) {
  const [phase, setPhase] = useState<VerifyPhase>('idle');

  const handleVerify = () => {
    setPhase('pending');
    setTimeout(() => setPhase('success'), 1600);
  };

  const handleReset = () => setPhase('idle');
  const handleSimulateFailure = () => {
    setPhase('pending');
    setTimeout(() => setPhase('failure'), 1600);
  };

  const steps = phase === 'success' ? STEPS_SUCCESS : STEPS_FAILURE;

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
          <Text style={s.navTitle}>Verify Credential</Text>
          <View style={s.navSpacer} />
        </View>

        {/* Idle State */}
        {phase === 'idle' && (
          <>
            <View style={s.instructionCard}>
              <Text style={s.instructionTitle}>How verification works</Text>
              <Text style={s.instructionBody}>
                Sovereign Trust uses your hardware-backed key and Face ID to
                confirm your identity. Your private key never leaves the device.
                The verifier receives only a cryptographic proof.
              </Text>
            </View>

            <Text style={s.sectionLabel}>CREDENTIAL TO VERIFY</Text>
            <View style={s.detailCard}>
              {Object.entries(CREDENTIAL).map(([key, val], i, arr) => (
                <View key={key}>
                  <View style={s.fieldRow}>
                    <Text style={s.fieldKey}>
                      {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                    </Text>
                    <Text
                      style={[s.fieldVal, key === 'subject' || key === 'issuer' ? s.mono : null]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {val}
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={s.rowDivider} />}
                </View>
              ))}
            </View>

            <View style={s.ctaSection}>
              <TouchableOpacity
                style={s.primaryButton}
                onPress={handleVerify}
                activeOpacity={0.75}
              >
                <Text style={s.primaryButtonText}>Verify with Face ID</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.ghostButton}
                onPress={handleSimulateFailure}
                activeOpacity={0.6}
              >
                <Text style={s.ghostButtonText}>Simulate Failure</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Pending State */}
        {phase === 'pending' && (
          <View style={s.centeredState}>
            <View style={s.pendingRing} />
            <Text style={s.pendingTitle}>Verifying</Text>
            <Text style={s.pendingSub}>
              Checking signature chain and revocation status...
            </Text>
          </View>
        )}

        {/* Success State */}
        {phase === 'success' && (
          <>
            <View style={[s.resultBanner, s.resultBannerSuccess]}>
              <View style={[s.resultIcon, s.resultIconSuccess]}>
                <Text style={s.resultIconText}>OK</Text>
              </View>
              <View style={s.resultContent}>
                <Text style={s.resultTitle}>Credential Verified</Text>
                <Text style={s.resultSub}>
                  Signature valid · Issuer trusted · Not revoked
                </Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>VERIFICATION STEPS</Text>
            <View style={s.stepsCard}>
              {STEPS_SUCCESS.map((step, i) => (
                <View key={step.label}>
                  <View style={s.stepRow}>
                    <View style={[s.stepIndicator, s.stepPass]} />
                    <Text style={s.stepLabel}>{step.label}</Text>
                    <Text style={s.stepPassText}>Pass</Text>
                  </View>
                  {i < STEPS_SUCCESS.length - 1 && <View style={s.rowDivider} />}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={s.resetButton}
              onPress={handleReset}
              activeOpacity={0.6}
            >
              <Text style={s.resetButtonText}>Verify Another</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Failure State */}
        {phase === 'failure' && (
          <>
            <View style={[s.resultBanner, s.resultBannerFailure]}>
              <View style={[s.resultIcon, s.resultIconFailure]}>
                <Text style={s.resultIconText}>!</Text>
              </View>
              <View style={s.resultContent}>
                <Text style={s.resultTitle}>Verification Failed</Text>
                <Text style={s.resultSub}>
                  Signature mismatch — credential cannot be trusted
                </Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>VERIFICATION STEPS</Text>
            <View style={s.stepsCard}>
              {STEPS_FAILURE.map((step, i) => (
                <View key={step.label}>
                  <View style={s.stepRow}>
                    <View
                      style={[
                        s.stepIndicator,
                        step.status === 'pass' ? s.stepPass
                          : step.status === 'fail' ? s.stepFail
                          : s.stepSkip,
                      ]}
                    />
                    <Text
                      style={[
                        s.stepLabel,
                        step.status === 'skip' && s.stepLabelMuted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text
                      style={
                        step.status === 'pass' ? s.stepPassText
                          : step.status === 'fail' ? s.stepFailText
                          : s.stepSkipText
                      }
                    >
                      {step.status === 'skip' ? 'Skipped' : step.status === 'pass' ? 'Pass' : 'Fail'}
                    </Text>
                  </View>
                  {i < STEPS_FAILURE.length - 1 && <View style={s.rowDivider} />}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={s.resetButton}
              onPress={handleReset}
              activeOpacity={0.6}
            >
              <Text style={s.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingBottom: 48 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  navBack: { fontSize: 17, color: '#007AFF', fontWeight: '400', width: 60 },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  navSpacer: { width: 60 },
  instructionCard: {
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
  instructionTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  instructionBody: { fontSize: 14, color: '#6C6C70', lineHeight: 21 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: '#8E8E93',
    letterSpacing: 0.7, marginTop: 24, marginBottom: 8, marginHorizontal: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden',
  },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 11 },
  fieldKey: {
    fontSize: 10, fontWeight: '600', color: '#AEAEB2',
    letterSpacing: 0.5, marginBottom: 3,
  },
  fieldVal: { fontSize: 14, color: '#1C1C1E' },
  mono: { fontFamily: 'Menlo', fontSize: 12, color: '#3C3C43' },
  rowDivider: {
    height: StyleSheet.hairlineWidth, backgroundColor: '#F2F2F7', marginLeft: 16,
  },
  ctaSection: { paddingHorizontal: 16, marginTop: 28, gap: 12 },
  primaryButton: {
    backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  ghostButton: {
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#D1D1D6',
  },
  ghostButtonText: { fontSize: 15, fontWeight: '500', color: '#6C6C70' },
  centeredState: {
    alignItems: 'center', paddingTop: 80, paddingHorizontal: 32,
  },
  pendingRing: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3, borderColor: '#E5E5EA',
    borderTopColor: '#1C1C1E',
    marginBottom: 24,
  },
  pendingTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  pendingSub: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 21 },
  resultBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 20, borderRadius: 14,
    padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  resultBannerSuccess: { backgroundColor: '#F0FFF4', borderColor: '#34C759' },
  resultBannerFailure: { backgroundColor: '#FFF5F5', borderColor: '#FF3B30' },
  resultIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  resultIconSuccess: { backgroundColor: '#34C759' },
  resultIconFailure: { backgroundColor: '#FF3B30' },
  resultIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  resultContent: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 3 },
  resultSub: { fontSize: 13, color: '#6C6C70', lineHeight: 18 },
  stepsCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  stepIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  stepPass: { backgroundColor: '#34C759' },
  stepFail: { backgroundColor: '#FF3B30' },
  stepSkip: { backgroundColor: '#D1D1D6' },
  stepLabel: { flex: 1, fontSize: 14, color: '#1C1C1E' },
  stepLabelMuted: { color: '#AEAEB2' },
  stepPassText: { fontSize: 13, color: '#34C759', fontWeight: '500' },
  stepFailText: { fontSize: 13, color: '#FF3B30', fontWeight: '500' },
  stepSkipText: { fontSize: 13, color: '#AEAEB2', fontWeight: '500' },
  resetButton: {
    marginHorizontal: 16, marginTop: 20, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D1D6',
  },
  resetButtonText: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
});