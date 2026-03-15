/**
 * CredentialCard
 *
 * Apple Wallet-style pass card for a single credential.
 */

import React, { useRef, useState } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { colors } from '../../../theme/colors'
import { radius } from '../../../theme/radius'
import { typography } from '../../../theme/typography'
import { AppBadge } from '../../../components/common/AppBadge'
import { GlassCard } from '../../../components/common/GlassCard'
import { CREDENTIAL_TYPE_META } from '../../../models/credential'

import type { CredentialWithIssuer } from '../../../models/credential'

interface CredentialCardProps {
  credential: CredentialWithIssuer
  onPress?: (credential: CredentialWithIssuer) => void
  onShare?: (credential: CredentialWithIssuer) => void
}

// typography fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = typography as Record<string, any>

const typo = {
  caption: t.captionSm ?? t.caption ?? {},
  body: t.bodySm ?? t.body ?? {},
  headline: t.headlineSm ?? t.headline ?? {},
  button: t.buttonXs ?? t.button ?? {},
  label: t.label ?? {},
  mono: t.mono ?? {},
  title3: t.title3 ?? {},
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onPress,
  onShare,
}) => {

  const [tapLayer, setTapLayer] = useState(0)
  const expandAnim = useRef(new Animated.Value(0)).current

  // SAFETY GUARDS
  const meta = CREDENTIAL_TYPE_META?.[credential?.type] ?? {
    label: 'Credential',
    accentColor: '#888',
  }

  const accentColor = meta?.accentColor ?? '#888'

  const issuerName = credential?.issuer?.shortName ?? 'Unknown Issuer'
  const issuerEmoji = credential?.issuer?.logoEmoji ?? '🏛️'

  const description = credential?.description ?? ''

  const isExpired =
    credential?.expiresAt
      ? new Date(credential.expiresAt) < new Date()
      : false

  const handleTapLayer = (layer: number) => {
    setTapLayer(layer)

    Animated.spring(expandAnim, {
      toValue: layer,
      useNativeDriver: false,
      speed: 18,
      bounciness: 4,
    }).start()
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'

    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  const trustNodes: string[] = [
    issuerName,
    meta.label ?? 'Credential',
    'You',
  ]

  return (
    <GlassCard
      glowState={credential?.trustState ?? 'unknown'}
      revealLayers={3}
      onTapLayer={handleTapLayer}
      padding="none"
      style={styles.card}
    >

      {/* Accent Stripe */}

      <View
        style={[
          styles.accentStripe,
          { backgroundColor: accentColor },
        ]}
      >
        <View
          style={[
            styles.accentStripeInner,
            { backgroundColor: `${accentColor}40` },
          ]}
        />
      </View>

      <View style={styles.body}>

        {/* Header */}

        <View style={styles.headerRow}>

          <View style={styles.issuerRow}>

            <View
              style={[
                styles.issuerEmoji,
                { borderColor: `${accentColor}60` },
              ]}
            >
              <Text style={styles.emojiText}>
                {issuerEmoji}
              </Text>
            </View>

            <View>
              <Text style={styles.issuerName}>
                {issuerName}
              </Text>

              <Text style={styles.credType}>
                {(meta.label ?? 'Credential').toUpperCase()}
              </Text>
            </View>

          </View>

          <AppBadge
            label={isExpired ? 'Expired' : credential?.trustState}
            variant={isExpired ? 'revoked' : credential?.trustState}
            dot
            size="sm"
          />

        </View>

        {/* Title */}

        <Text style={styles.credTitle}>
          {credential?.title ?? 'Untitled Credential'}
        </Text>

        <Text
          style={styles.credDesc}
          numberOfLines={2}
        >
          {description}
        </Text>

        {/* Dates */}

        <View style={styles.datesRow}>

          <DateChip
            label="ISSUED"
            value={formatDate(credential?.issuedAt)}
          />

          {credential?.expiresAt ? (
            <DateChip
              label="EXPIRES"
              value={formatDate(credential.expiresAt)}
              warn={isExpired}
            />
          ) : (
            <DateChip
              label="EXPIRES"
              value="No expiry"
            />
          )}

        </View>

        {/* Layer 1 */}

        {tapLayer >= 1 && (
          <Animated.View style={styles.revealLayer}>

            <View style={styles.layerDivider} />

            <Text style={styles.layerHeading}>
              VERIFICATION DETAILS
            </Text>

            <DetailRow
              label="Issuer DID"
              value={`${credential?.issuerDid?.slice?.(0, 28) ?? 'Unknown'}…`}
              mono
            />

            <DetailRow
              label="Proof hash"
              value={`${credential?.proofHash?.slice?.(0, 20) ?? 'Unknown'}…`}
              mono
            />

            <DetailRow
              label="Algorithm"
              value={credential?.signatureAlgorithm ?? 'Unknown'}
            />

            <DetailRow
              label="Verified"
              value={
                credential?.isVerified
                  ? '✓ Yes'
                  : '✕ No'
              }
            />

          </Animated.View>
        )}

        {/* Layer 2 */}

        {tapLayer >= 2 && (
          <Animated.View style={styles.revealLayer}>

            <View style={styles.layerDivider} />

            <Text style={styles.layerHeading}>
              TRUST GRAPH
            </Text>

            <View style={styles.trustGraph}>

              {trustNodes.map((node, i) => (
                <React.Fragment key={i}>

                  <View
                    style={[
                      styles.trustNode,
                      { borderColor: accentColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trustNodeText,
                        { color: accentColor },
                      ]}
                    >
                      {node}
                    </Text>
                  </View>

                  {i < trustNodes.length - 1 && (
                    <Text style={styles.trustArrow}>
                      →
                    </Text>
                  )}

                </React.Fragment>
              ))}

            </View>

          </Animated.View>
        )}

        {/* Footer */}

        <View style={styles.footerRow}>

          <Text style={styles.tapHint}>
            {tapLayer === 0
              ? 'Tap to see details'
              : tapLayer === 1
              ? 'Tap for trust graph'
              : 'Tap to collapse'}
          </Text>

          {onShare && (
            <TouchableOpacity
              style={[
                styles.shareBtn,
                { borderColor: `${accentColor}80` },
              ]}
              onPress={() => onShare(credential)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.shareBtnText,
                  { color: accentColor },
                ]}
              >
                Share QR
              </Text>
            </TouchableOpacity>
          )}

        </View>

      </View>

    </GlassCard>
  )
}

// Sub Components

const DateChip: React.FC<{
  label: string
  value: string
  warn?: boolean
}> = ({ label, value, warn = false }) => (
  <View style={dateStyles.chip}>
    <Text style={dateStyles.chipLabel}>{label}</Text>
    <Text
      style={[
        dateStyles.chipValue,
        warn && { color: '#FF3355' },
      ]}
    >
      {value}
    </Text>
  </View>
)

const dateStyles = StyleSheet.create({
  chip: { flex: 1 },
  chipLabel: {
    ...typo.caption,
    color: colors.text.quaternary,
    fontSize: 8,
    marginBottom: 2,
  },
  chipValue: {
    ...typo.caption,
    color: colors.text.secondary,
  },
})

const DetailRow: React.FC<{
  label: string
  value: string
  mono?: boolean
}> = ({ label, value, mono = false }) => (
  <View style={detailStyles.row}>
    <Text style={detailStyles.rowLabel}>{label}</Text>
    <Text
      style={[
        detailStyles.rowValue,
        mono && detailStyles.rowMono,
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
)

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rowLabel: {
    ...typo.caption,
    color: colors.text.quaternary,
    flexShrink: 0,
    marginRight: 8,
  },
  rowValue: {
    ...typo.caption,
    color: colors.text.secondary,
    flex: 1,
    textAlign: 'right',
  },
  rowMono: {
    ...typo.mono,
    fontSize: 10,
  },
})

const styles = StyleSheet.create({

  card: {},

  accentStripe: {
    height: 4,
    position: 'relative',
    overflow: 'hidden',
  },

  accentStripeInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  body: {
    padding: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  issuerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  issuerEmoji: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiText: { fontSize: 18 },

  issuerName: {
    ...typo.headline,
    color: colors.text.primary,
  },

  credType: {
    ...typo.label,
    color: colors.text.quaternary,
    fontSize: 8,
    marginTop: 1,
  },

  credTitle: {
    ...typo.title3,
    color: colors.text.primary,
    marginBottom: 3,
  },

  credDesc: {
    ...typo.body,
    color: colors.text.tertiary,
    marginBottom: 12,
  },

  datesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },

  revealLayer: {
    marginTop: 8,
  },

  layerDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: 12,
  },

  layerHeading: {
    ...typo.label,
    color: colors.text.quaternary,
    marginBottom: 8,
  },

  trustGraph: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },

  trustNode: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },

  trustNodeText: {
    ...typo.caption,
    fontWeight: '600',
  },

  trustArrow: {
    ...typo.caption,
    color: colors.text.quaternary,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  tapHint: {
    ...typo.caption,
    color: colors.text.quaternary,
  },

  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.glass.subtle,
  },

  shareBtnText: {
    ...typo.button,
  },
})