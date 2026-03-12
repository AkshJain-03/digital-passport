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

type ScanPhase = 'ready' | 'scanning' | 'result';

type Props = { navigation: any };

const MOCK_RESULT = {
  type: 'VerifiablePresentation',
  holder: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  credential: 'EmploymentCredential',
  issuedBy: 'did:web:credentials.acmecorp.com',
  nonce: 'a3f91bc2-44d8-4e1c-9c0e-1f2a3b4c5d6e',
  format: 'jwt_vp_json',
};

export default function Scan({ navigation }: Props) {
  const [phase, setPhase] = useState<ScanPhase>('ready');

  const handleScan = () => {
    setPhase('scanning');
    setTimeout(() => setPhase('result'), 1800);
  };

  const handleReset = () => setPhase('ready');

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
          <Text style={s.navTitle}>Scan & Verify</Text>
          <View style={s.navSpacer} />
        </View>

        {/* Instructions */}
        {phase === 'ready' && (
          <View style={s.instructionCard}>
            <Text style={s.instructionTitle}>How to scan</Text>
            <Text style={s.instructionBody}>
              Align a Sovereign Trust QR code within the frame. The app will
              read the Verifiable Presentation and verify it against the
              issuer's DID document automatically.
            </Text>
          </View>
        )}

        {/* Viewfinder */}
        <View style={s.viewfinderContainer}>
          <View style={s.viewfinder}>
            {/* Corner brackets */}
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />

            {phase === 'ready' && (
              <View style={s.viewfinderIdle}>
                <Text style={s.viewfinderIdleText}>Position QR code here</Text>
                <Text style={s.viewfinderIdleSub}>
                  Keep the code flat and well-lit
                </Text>
              </View>
            )}

            {phase === 'scanning' && (
              <View style={s.scanLine} />
            )}

            {phase === 'result' && (
              <View style={s.viewfinderSuccess}>
                <View style={s.successCircle}>
                  <Text style={s.successMark}>OK</Text>
                </View>
                <Text style={s.viewfinderSuccessText}>Code Detected</Text>
              </View>
            )}
          </View>

          {phase === 'scanning' && (
            <Text style={s.scanningCaption}>Scanning...</Text>
          )}
        </View>

        {/* Scan Button */}
        {phase === 'ready' && (
          <View style={s.ctaSection}>
            <TouchableOpacity
              style={s.primaryButton}
              onPress={handleScan}
              activeOpacity={0.75}
            >
              <Text style={s.primaryButtonText}>Simulate Scan</Text>
            </TouchableOpacity>
            <Text style={s.ctaHint}>
              Camera access is handled by iOS. Tap to simulate a credential scan.
            </Text>
          </View>
        )}

        {/* Scan Result */}
        {phase === 'result' && (
          <>
            <Text style={s.sectionLabel}>SCANNED PAYLOAD</Text>
            <View style={s.resultCard}>
              {Object.entries(MOCK_RESULT).map(([key, val], i, arr) => (
                <View key={key}>
                  <View style={s.fieldRow}>
                    <Text style={s.fieldKey}>
                      {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        s.fieldVal,
                        (key === 'holder' || key === 'issuedBy' || key === 'nonce') && s.mono,
                      ]}
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
                onPress={() => navigation.navigate('Verify')}
                activeOpacity={0.75}
              >
                <Text style={s.primaryButtonText}>Verify This Credential</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.ghostButton}
                onPress={handleReset}
                activeOpacity={0.6}
              >
                <Text style={s.ghostButtonText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

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
  instructionCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 20,
    borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  instructionTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  instructionBody: { fontSize: 14, color: '#6C6C70', lineHeight: 21 },
  viewfinderContainer: { marginHorizontal: 16, marginTop: 20, alignItems: 'center' },
  viewfinder: {
    width: '100%',
    height: 280,
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FFFFFF',
  },
  cornerTL: { top: 18, left: 18, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderTopLeftRadius: 4 },
  cornerTR: { top: 18, right: 18, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderTopRightRadius: 4 },
  cornerBL: { bottom: 18, left: 18, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 18, right: 18, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderBottomRightRadius: 4 },
  viewfinderIdle: { alignItems: 'center' },
  viewfinderIdleText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '500', marginBottom: 4 },
  viewfinderIdleSub: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
  scanLine: {
    position: 'absolute',
    left: 24, right: 24,
    height: 2,
    backgroundColor: '#007AFF',
    top: '45%',
    borderRadius: 1,
  },
  scanningCaption: { color: '#8E8E93', fontSize: 14, marginTop: 14 },
  viewfinderSuccess: { alignItems: 'center' },
  successCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#34C759',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  successMark: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  viewfinderSuccessText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  ctaSection: { paddingHorizontal: 16, marginTop: 24, gap: 12 },
  primaryButton: {
    backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  ghostButton: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#D1D1D6',
  },
  ghostButtonText: { fontSize: 15, fontWeight: '500', color: '#6C6C70' },
  ctaHint: { fontSize: 12, color: '#AEAEB2', textAlign: 'center', lineHeight: 17 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.7,
    marginTop: 28, marginBottom: 8, marginHorizontal: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden',
  },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 11 },
  fieldKey: { fontSize: 10, fontWeight: '600', color: '#AEAEB2', letterSpacing: 0.5, marginBottom: 3 },
  fieldVal: { fontSize: 14, color: '#1C1C1E' },
  mono: { fontFamily: 'Menlo', fontSize: 12, color: '#3C3C43' },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#F2F2F7', marginLeft: 16 },
});