/**
 * CredentialQRSheet
 *
 * Bottom sheet displaying a QR code for sharing a specific credential.
 *
 * Features:
 *   • Animated slide-up from bottom
 *   • QR code rendered via react-native-qrcode-svg
 *   • Glassmorphism panel
 *   • Credential summary header
 *   • Expiry warning if credential is near expiry
 *   • Dismiss on backdrop tap or swipe
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { colors }                    from '../../../theme/colors';
import { radius }                    from '../../../theme/radius';
import { shadows }                   from '../../../theme/shadows';
import { spacing }                   from '../../../theme/spacing';
import { typography }                from '../../../theme/typography';
import { AppBadge }                  from '../../../components/common/AppBadge';
import { CREDENTIAL_TYPE_META }      from '../../../models/credential';
import { qrGeneratorService }        from '../../../services/qr/qrGeneratorService';
import type { CredentialWithIssuer } from '../../../models/credential';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = 520;

interface CredentialQRSheetProps {
  credential: CredentialWithIssuer | null;
  visible:    boolean;
  onDismiss:  () => void;
}

export const CredentialQRSheet: React.FC<CredentialQRSheetProps> = ({
  credential,
  visible,
  onDismiss,
}) => {
  const slideAnim   = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOp  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0, useNativeDriver: true,
          speed: 14, bounciness: 4,
        }),
        Animated.timing(backdropOp, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT, duration: 280, useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 0, duration: 250, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOp]);

  if (!credential) return null;

  const meta      = CREDENTIAL_TYPE_META[credential.type];
  const qrString  = qrGeneratorService.buildCredentialQRString(credential);
  const isExpired = credential.expiresAt
    ? new Date(credential.expiresAt) < new Date()
    : false;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
          shadows['2xl'],
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.typeIcon, { borderColor: meta.accentColor + '60' }]}>
              <Text style={styles.typeEmoji}>{credential.issuer.logoEmoji}</Text>
            </View>
            <View>
              <Text style={styles.credTitle} numberOfLines={1}>
                {credential.title}
              </Text>
              <Text style={styles.issuerName}>{credential.issuer.shortName}</Text>
            </View>
          </View>
          <AppBadge
            label={isExpired ? 'Expired' : credential.trustState}
            variant={isExpired ? 'revoked' : credential.trustState}
            dot
            size="sm"
          />
        </View>

        {/* QR Code area */}
        <View style={styles.qrWrapper}>
          {/* Glow ring behind QR */}
          <View
            style={[
              styles.qrGlowRing,
              { borderColor: meta.accentColor + '40' },
            ]}
          />
          <View style={styles.qrContainer}>
            <QRCode
              value={qrString}
              size={200}
              color={colors.text.primary}
              backgroundColor="transparent"
              quietZone={12}
            />
          </View>
        </View>

        {/* Instructions */}
        <Text style={styles.instruction}>
          Ask the verifier to scan this code
        </Text>

        {/* Expiry warning */}
        {isExpired && (
          <View style={styles.warningRow}>
            <Text style={styles.warningIcon}>⚠</Text>
            <Text style={styles.warningText}>
              This credential expired on{' '}
              {credential.expiresAt?.slice(0, 10)}
            </Text>
          </View>
        )}

        {/* Credential ID (truncated) */}
        <View style={styles.credIdRow}>
          <Text style={styles.credIdLabel}>CREDENTIAL ID</Text>
          <Text style={styles.credIdValue}>
            {credential.id.slice(0, 8).toUpperCase()}…
          </Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={onDismiss}
          activeOpacity={0.75}
        >
          <Text style={styles.dismissText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,8,16,0.80)',
  },
  sheet: {
    position:         'absolute',
    bottom:           0,
    left:             0,
    right:            0,
    height:           SHEET_HEIGHT,
    backgroundColor:  colors.bg.elevated,
    borderTopLeftRadius:  radius['4xl'],
    borderTopRightRadius: radius['4xl'],
    borderTopWidth:   1,
    borderLeftWidth:  1,
    borderRightWidth: 1,
    borderColor:      colors.border.light,
    paddingHorizontal: spacing[5],
    paddingBottom:    spacing[8],
    overflow:         'hidden',
  },
  handle: {
    width:           44,
    height:          4,
    borderRadius:    radius.full,
    backgroundColor: colors.border.medium,
    alignSelf:       'center',
    marginTop:       spacing[3],
    marginBottom:    spacing[4],
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing[5],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
    flex:          1,
    marginRight:   spacing[3],
  },
  typeIcon: {
    width:           40,
    height:          40,
    borderRadius:    radius.xl,
    borderWidth:     1,
    backgroundColor: colors.glass.medium,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  typeEmoji:   { fontSize: 20 },
  credTitle:   { ...typography.headline, color: colors.text.primary },
  issuerName:  { ...typography.captionSm, color: colors.text.tertiary, marginTop: 1 },
  qrWrapper: {
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   spacing[4],
    position:       'relative',
  },
  qrGlowRing: {
    position:    'absolute',
    width:       248,
    height:      248,
    borderRadius: radius['3xl'],
    borderWidth: 1.5,
  },
  qrContainer: {
    backgroundColor: colors.glass.heavy,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    borderColor:     colors.border.light,
    padding:         spacing[3],
  },
  instruction: {
    ...typography.bodySm,
    color:     colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  warningRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[2],
    backgroundColor: colors.trust.revoked.dim,
    borderRadius:   radius.xl,
    borderWidth:    1,
    borderColor:    colors.trust.revoked.solid + '40',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginBottom:   spacing[3],
  },
  warningIcon: { fontSize: 13, color: colors.trust.revoked.solid },
  warningText: { ...typography.captionSm, color: colors.trust.revoked.solid },
  credIdRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            spacing[2],
    marginBottom:   spacing[5],
  },
  credIdLabel: { ...typography.label, color: colors.text.quaternary },
  credIdValue: { ...typography.mono,  color: colors.text.tertiary },
  dismissBtn: {
    backgroundColor: colors.glass.heavy,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    borderColor:     colors.border.medium,
    paddingVertical: spacing[3] + 2,
    alignItems:      'center',
  },
  dismissText: { ...typography.button, color: colors.text.primary },
});
