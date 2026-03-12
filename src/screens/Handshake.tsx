import React, { useState } from 'react';
import { signData } from '../crypto/hardwareKey';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

type HandshakeMode = 'login' | 'supply';
type StepStatus = 'pending' | 'active' | 'done';

type Step = {
  id: number;
  title: string;
  detail: string;
};

const LOGIN_STEPS: Step[] = [
  { id: 1, title: 'Challenge Received',    detail: 'Verifier issued nonce: a3f91bc2-44d8-4e1c' },
  { id: 2, title: 'Face ID Prompt',        detail: 'System requested biometric to release hardware key' },
  { id: 3, title: 'Key Unlocked',          detail: 'Secure Enclave authorized signing key P-256' },
  { id: 4, title: 'Response Signed',       detail: 'challenge + DID signed with Ed25519 private key' },
  { id: 5, title: 'Proof Transmitted',     detail: 'Signed payload delivered to verifier endpoint' },
  { id: 6, title: 'Authentication Complete', detail: 'Verifier confirmed signature — session granted' },
];

const SUPPLY_STEPS: Step[] = [
  { id: 1, title: 'Handoff Initiated',     detail: 'Originator created custody credential with product hash' },
  { id: 2, title: 'QR Code Scanned',       detail: 'Recipient scanned label — presentation extracted' },
  { id: 3, title: 'Credential Verified',   detail: 'Signature chain validated against originator DID' },
  { id: 4, title: 'Face ID Confirmation',  detail: 'Recipient confirmed receipt via biometric proof' },
  { id: 5, title: 'Custody Signed',        detail: 'Audit log entry appended — both parties hold proof' },
  { id: 6, title: 'Transfer Complete',     detail: 'Ownership record updated — chain of custody intact' },
];

type Props = { navigation: any };

export default function Handshake({ navigation }: Props) {
  const [mode, setMode]       = useState<HandshakeMode>('login');
  const [activeStep, setStep] = useState<number>(0);
  const [running, setRunning] = useState(false);

  const steps  = mode === 'login' ? LOGIN_STEPS : SUPPLY_STEPS;
  const isDone = activeStep >= steps.length;

  const stepStatus = (index: number): StepStatus => {
    if (index < activeStep)  return 'done';
    if (index === activeStep) return 'active';
    return 'pending';
  };

  const handleAdvance = async () => {
  if (running || isDone) return;
  setRunning(true);

  try {
    // 🔐 LOGIN MODE — Face ID at step 2
    if (mode === 'login' && activeStep === 1) {
      await signData('login-challenge-nonce');
    }

    // 🔐 SUPPLY MODE — Face ID at step 4
    if (mode === 'supply' && activeStep === 3) {
      await signData('supply-chain-custody-proof');
    }

    setTimeout(() => {
      setStep((s) => s + 1);
      setRunning(false);
    }, 300);
  } catch (err) {
    console.warn('Biometric cancelled or failed');
    setRunning(false);
  }
};


  const handleReset = () => {
    setStep(0);
    setRunning(false);
  };

  const switchMode = (m: HandshakeMode) => {
    setMode(m);
    setStep(0);
    setRunning(false);
  };

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
          <Text style={s.navTitle}>Trust Handshake</Text>
          <View style={s.navSpacer} />
        </View>

        {/* Mode Selector */}
        <View style={s.modeWrap}>
          <View style={s.modeSegment}>
            {(['login', 'supply'] as HandshakeMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.modeBtn, mode === m && s.modeBtnActive]}
                onPress={() => switchMode(m)}
                activeOpacity={0.7}
              >
                <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                  {m === 'login' ? 'DID Login' : 'Supply Chain'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.descCard}>
          <Text style={s.descBody}>
            {mode === 'login'
              ? 'A cryptographic challenge-response authentication using your hardware-backed DID. No passwords involved at any stage.'
              : 'A verifiable custody transfer protocol. Both parties receive cryptographic proof of the handoff — immutable and auditable.'}
          </Text>
        </View>

        {/* Progress Header */}
        <View style={s.progressHeader}>
          <Text style={s.sectionLabel}>
            {isDone ? 'COMPLETE' : `STEP ${activeStep + 1} OF ${steps.length}`}
          </Text>
          <View style={s.progressBarTrack}>
            <View
              style={[
                s.progressBarFill,
                { width: `${(activeStep / steps.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Steps */}
        <View style={s.stepList}>
          {steps.map((step, index) => {
            const status = stepStatus(index);
            return (
              <View key={step.id} style={s.stepItem}>
                {/* Connector */}
                {index > 0 && (
                  <View
                    style={[
                      s.connector,
                      index <= activeStep && s.connectorActive,
                    ]}
                  />
                )}

                <View style={s.stepBody}>
                  {/* Step Circle */}
                  <View
                    style={[
                      s.stepCircle,
                      status === 'done'   && s.stepCircleDone,
                      status === 'active' && s.stepCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.stepCircleText,
                        (status === 'done' || status === 'active') && s.stepCircleTextLight,
                      ]}
                    >
                      {status === 'done' ? '✓' : step.id}
                    </Text>
                  </View>

                  {/* Content */}
                  <View
                    style={[
                      s.stepContent,
                      status === 'active' && s.stepContentActive,
                      status === 'pending' && s.stepContentPending,
                    ]}
                  >
                    <Text
                      style={[
                        s.stepTitle,
                        status === 'pending' && s.stepTitlePending,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {status !== 'pending' && (
                      <Text style={s.stepDetail}>{step.detail}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Controls */}
        <View style={s.controls}>
          {!isDone ? (
            <TouchableOpacity
              style={[s.primaryButton, running && s.primaryButtonDisabled]}
              onPress={handleAdvance}
              disabled={running}
              activeOpacity={0.75}
            >
              <Text style={s.primaryButtonText}>
                {activeStep === 0 ? 'Begin Handshake' : 'Next Step'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={s.completeBanner}>
                <View style={s.completeDot} />
                <Text style={s.completeBannerText}>
                  {mode === 'login'
                    ? 'Authentication Complete'
                    : 'Custody Transfer Complete'}
                </Text>
              </View>
              <TouchableOpacity
                style={s.ghostButton}
                onPress={handleReset}
                activeOpacity={0.6}
              >
                <Text style={s.ghostButtonText}>Run Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
  modeWrap: { paddingHorizontal: 16, paddingTop: 20 },
  modeSegment: {
    flexDirection: 'row', backgroundColor: '#E5E5EA',
    borderRadius: 10, padding: 2,
  },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  modeBtnText: { fontSize: 14, fontWeight: '500', color: '#8E8E93' },
  modeBtnTextActive: { color: '#1C1C1E' },
  descCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  descBody: { fontSize: 14, color: '#6C6C70', lineHeight: 21 },
  progressHeader: { paddingHorizontal: 20, marginTop: 28, marginBottom: 6 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.7, marginBottom: 8,
  },
  progressBarTrack: {
    height: 4, backgroundColor: '#E5E5EA', borderRadius: 2, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#1C1C1E', borderRadius: 2 },
  stepList: { paddingHorizontal: 16, marginTop: 8 },
  stepItem: { position: 'relative' },
  connector: {
    position: 'absolute', left: 19, top: 0,
    width: 2, height: 20,
    backgroundColor: '#E5E5EA', zIndex: 0,
  },
  connectorActive: { backgroundColor: '#34C759' },
  stepBody: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginTop: 16, zIndex: 1,
  },
  stepCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E5E5EA',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  stepCircleDone: { backgroundColor: '#34C759' },
  stepCircleActive: { backgroundColor: '#1C1C1E' },
  stepCircleText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  stepCircleTextLight: { color: '#FFFFFF' },
  stepContent: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, minHeight: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  stepContentActive: { borderWidth: 1.5, borderColor: '#1C1C1E' },
  stepContentPending: { backgroundColor: '#F9F9F9', shadowOpacity: 0 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  stepTitlePending: { color: '#C7C7CC', fontWeight: '400' },
  stepDetail: { fontSize: 13, color: '#6C6C70', marginTop: 4, lineHeight: 19 },
  controls: { paddingHorizontal: 16, marginTop: 28, gap: 12 },
  primaryButton: {
    backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  primaryButtonDisabled: { backgroundColor: '#8E8E93' },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  completeBanner: {
    backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#34C759',
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  completeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34C759' },
  completeBannerText: { fontSize: 16, fontWeight: '600', color: '#1E6B3C' },
  ghostButton: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#D1D1D6',
  },
  ghostButtonText: { fontSize: 15, fontWeight: '500', color: '#6C6C70' },
});