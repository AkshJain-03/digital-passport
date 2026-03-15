/**
 * VisionScreen
 *
 * Showcases 20 global use-cases for a Universal Trust Wallet.
 * Follows the project's dark glassmorphism design system with
 * animated bubble glow effects on each category card.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors }     from '../../theme/colors';
import { radius }     from '../../theme/radius';
import { shadows }    from '../../theme/shadows';
import { spacing }    from '../../theme/spacing';
import { typography } from '../../theme/typography';

// ─── Types ─────────────────────────────────────────────────────────────────

type CategoryColor = {
  solid: string;
  dim:   string;
  glow:  string;
};

interface UseCase {
  id:          number;
  title:       string;
  icon:        string;
  category:    string;
  tagline:     string;
  description: string;
  examples:    string[];
  benefit:     string;
  color:       CategoryColor;
}

// ─── Color palette per category ────────────────────────────────────────────

const CAT_COLORS: Record<string, CategoryColor> = {
  identity:    colors.trust.trusted,
  education:   colors.trust.verified,
  professional:{ solid: '#7B61FF', dim: 'rgba(123,97,255,0.12)', glow: 'rgba(123,97,255,0.35)' },
  commerce:    colors.trust.suspicious,
  property:    { solid: '#00D4FF', dim: 'rgba(0,212,255,0.12)', glow: 'rgba(0,212,255,0.35)' },
  health:      colors.trust.revoked,
  government:  colors.trust.pending,
  digital:     { solid: '#FF6EC7', dim: 'rgba(255,110,199,0.12)', glow: 'rgba(255,110,199,0.35)' },
};

// ─── Use-case data ──────────────────────────────────────────────────────────

const USE_CASES: UseCase[] = [
  {
    id: 1,
    title: 'Identity & Login Everywhere',
    icon: '◈',
    category: 'identity',
    tagline: 'Replace passwords and KYC repetition',
    description: 'One scan replaces every password, OTP, and repeated KYC form.',
    examples: ['Login via QR + Face ID', 'Airport identity check', 'Banking authentication', 'Government portals'],
    benefit: 'No passwords · No OTPs · No repeated KYC',
    color: CAT_COLORS.identity,
  },
  {
    id: 2,
    title: 'Education & Academic Credentials',
    icon: '◎',
    category: 'education',
    tagline: 'Every degree becomes a verifiable credential',
    description: 'Degrees, certificates, and skills stored as cryptographic credentials.',
    examples: ['University degrees', 'Online course certs', 'Professional certifications', 'Student transcripts'],
    benefit: 'No fake degrees · Instant hiring verification · Portable globally',
    color: CAT_COLORS.education,
  },
  {
    id: 3,
    title: 'Professional Licensing',
    icon: '⊕',
    category: 'professional',
    tagline: 'Doctors, lawyers, engineers — verified instantly',
    description: 'Professional licenses stored in wallet with issuing authority, expiry, and proof.',
    examples: ['Medical licenses', 'Legal certifications', 'Engineering permits', 'Pilot licenses'],
    benefit: 'Instant validation · No manual board verification',
    color: CAT_COLORS.professional,
  },
  {
    id: 4,
    title: 'Product Authenticity',
    icon: '⊞',
    category: 'commerce',
    tagline: 'Solve the $500B+ counterfeit crisis',
    description: 'Each product carries a credential issued by its manufacturer.',
    examples: ['Pharmaceuticals', 'Luxury goods', 'Electronics', 'Art & collectibles'],
    benefit: 'Scan → see manufacturer, factory, production date & proof',
    color: CAT_COLORS.commerce,
  },
  {
    id: 5,
    title: 'Supply Chain Transparency',
    icon: '⊡',
    category: 'commerce',
    tagline: 'Every shipment transfer is a cryptographic event',
    description: 'Factory → Distributor → Retailer → Consumer, each step signs a credential.',
    examples: ['Cold-chain tracking', 'Food safety', 'Electronics sourcing', 'Raw materials'],
    benefit: 'Fraud reduction · Full traceability · Compliance',
    color: CAT_COLORS.commerce,
  },
  {
    id: 6,
    title: 'Property Ownership',
    icon: '⌂',
    category: 'property',
    tagline: 'Land titles and assets stored in your wallet',
    description: 'Government-signed ownership credentials replace paper deeds entirely.',
    examples: ['Land titles', 'Vehicle ownership', 'Asset records', 'Real-estate transfer'],
    benefit: 'Buyer scans → ownership verified instantly',
    color: CAT_COLORS.property,
  },
  {
    id: 7,
    title: 'Employment Verification',
    icon: '◉',
    category: 'identity',
    tagline: 'Eliminate background verification agencies',
    description: 'Role, company, start/end dates all signed by the company DID.',
    examples: ['Resume credentials', 'Role history', 'Salary verification', 'Reference checks'],
    benefit: 'Recruiter scans → verified · No third-party agencies',
    color: CAT_COLORS.identity,
  },
  {
    id: 8,
    title: 'Medical Records',
    icon: '⊛',
    category: 'health',
    tagline: 'Patient-controlled health credentials',
    description: 'Vaccinations, prescriptions, insurance, and allergies — all verifiable.',
    examples: ['Vaccination certs', 'Prescriptions', 'Insurance cards', 'Allergy records'],
    benefit: 'Hospital verifies instantly · Patient controls access',
    color: CAT_COLORS.health,
  },
  {
    id: 9,
    title: 'Travel & Immigration',
    icon: '◫',
    category: 'identity',
    tagline: 'Digital passport + visa in your wallet',
    description: 'Biometric confirmation replaces manual document checks at borders.',
    examples: ['Passport credentials', 'Visa proofs', 'Entry permits', 'Travel history'],
    benefit: 'Faster immigration · Reduced fraud · Paperless travel',
    color: CAT_COLORS.identity,
  },
  {
    id: 10,
    title: 'Insurance Claims',
    icon: '◪',
    category: 'property',
    tagline: 'Claims processed without paperwork',
    description: 'Damage report, medical report, and ownership proof as instant credentials.',
    examples: ['Auto claims', 'Health claims', 'Property damage', 'Life insurance'],
    benefit: 'Insurer verifies instantly · Claims processed faster',
    color: CAT_COLORS.property,
  },
  {
    id: 11,
    title: 'Financial Compliance',
    icon: '⊟',
    category: 'identity',
    tagline: 'KYC once, verified everywhere',
    description: 'Banks spend billions on KYC & AML. Complete it once; share credential forever.',
    examples: ['Bank onboarding', 'AML checks', 'Credit scoring', 'Cross-border payments'],
    benefit: 'No repeated KYC · Billions saved industry-wide',
    color: CAT_COLORS.identity,
  },
  {
    id: 12,
    title: 'Social Media Truth',
    icon: '◌',
    category: 'digital',
    tagline: 'Cryptographic proof behind every claim',
    description: 'Posts include issuer, timestamp, and authenticity proof to reduce misinformation.',
    examples: ['News articles', 'Election results', 'Research claims', 'Official statements'],
    benefit: 'Verification badge with issuer & timestamp',
    color: CAT_COLORS.digital,
  },
  {
    id: 13,
    title: 'Digital Contracts',
    icon: '◧',
    category: 'professional',
    tagline: 'Contracts signed with hardware keys',
    description: 'Freelance, employment, and business contracts with instant signature verification.',
    examples: ['Freelance agreements', 'Employment contracts', 'Business deals', 'NDAs'],
    benefit: 'Signature verification becomes instant',
    color: CAT_COLORS.professional,
  },
  {
    id: 14,
    title: 'Government Certificates',
    icon: '⊠',
    category: 'government',
    tagline: 'Paper government docs go digital',
    description: 'Birth certificates, marriage certs, tax filings, and licences as credentials.',
    examples: ['Birth certificates', 'Marriage certs', 'Tax filings', 'Driving licences'],
    benefit: 'Instantly verifiable · No physical paper needed',
    color: CAT_COLORS.government,
  },
  {
    id: 15,
    title: 'AI Content Verification',
    icon: '◩',
    category: 'digital',
    tagline: 'Sign AI-generated content cryptographically',
    description: 'Creators sign content; consumers verify creator, timestamp, and model used.',
    examples: ['AI articles', 'Synthetic media', 'Generated images', 'Deepfake detection'],
    benefit: 'Creator · Timestamp · Model used — all provable',
    color: CAT_COLORS.digital,
  },
  {
    id: 16,
    title: 'Academic Research Validation',
    icon: '⊹',
    category: 'education',
    tagline: 'Fight fake research with credential proofs',
    description: 'Papers include proof of author identity, institution, and peer review.',
    examples: ['Scientific papers', 'Peer review proofs', 'Author credentials', 'Institution verification'],
    benefit: 'No fake research · Trusted science globally',
    color: CAT_COLORS.education,
  },
  {
    id: 17,
    title: 'Event Tickets & Access',
    icon: '◔',
    category: 'commerce',
    tagline: 'Tickets as tamper-proof credentials',
    description: 'Concert, conference, or event entry via scan → verify credential → enter.',
    examples: ['Concert tickets', 'Conference passes', 'Stadium entry', 'VIP access'],
    benefit: 'Prevents ticket fraud · Instant entry',
    color: CAT_COLORS.commerce,
  },
  {
    id: 18,
    title: 'Charity & Donations',
    icon: '◕',
    category: 'government',
    tagline: 'Donors verify exactly where funds go',
    description: 'Charity publishes signed spending credentials. Transparency builds trust.',
    examples: ['NGO spending', 'Donation tracking', 'Relief fund allocation', 'Audit trails'],
    benefit: 'Full transparency · Higher donor trust',
    color: CAT_COLORS.government,
  },
  {
    id: 19,
    title: 'Government Welfare Distribution',
    icon: '◑',
    category: 'government',
    tagline: 'Benefits issued as fraud-proof credentials',
    description: 'Food subsidy, healthcare eligibility, and social benefits — all verifiable.',
    examples: ['Food subsidies', 'Healthcare access', 'Education grants', 'Housing benefits'],
    benefit: 'Prevents fraud · Reaches rightful recipients',
    color: CAT_COLORS.government,
  },
  {
    id: 20,
    title: 'Voting Systems (Future)',
    icon: '◒',
    category: 'government',
    tagline: 'Secure remote voting with key signatures',
    description: 'Voting credentials from election authorities; votes signed by voter keys.',
    examples: ['National elections', 'Local referendums', 'Corporate voting', 'DAO governance'],
    benefit: 'Cryptographically secure · Auditable · Remote-capable',
    color: CAT_COLORS.government,
  },
];

// ─── Category filter labels ─────────────────────────────────────────────────

const CATEGORY_FILTERS = [
  { key: 'all',          label: 'All',         icon: '⊕' },
  { key: 'identity',    label: 'Identity',    icon: '◈' },
  { key: 'education',   label: 'Education',   icon: '◎' },
  { key: 'professional',label: 'Professional',icon: '⊕' },
  { key: 'commerce',    label: 'Commerce',    icon: '⊡' },
  { key: 'property',    label: 'Property',    icon: '⌂' },
  { key: 'health',      label: 'Health',      icon: '⊛' },
  { key: 'government',  label: 'Gov\'t',      icon: '⊠' },
  { key: 'digital',     label: 'Digital',     icon: '◌' },
];

const TAB_BAR_CLEARANCE = Platform.OS === 'ios' ? 112 : 96;

// ─── Animated Use-Case Card ─────────────────────────────────────────────────

const UseCaseCard: React.FC<{ item: UseCase; index: number }> = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const glowAnim    = useRef(new Animated.Value(0.6)).current;
  const expandAnim  = useRef(new Animated.Value(0)).current;
  const entryAnim   = useRef(new Animated.Value(0)).current;

  // Staggered entry
  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  // Pulsing glow
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.4, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2400, useNativeDriver: true }),
      ]),
    ).start();
  }, [glowAnim]);

  const handlePress = () => {
    // Press spring
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 3 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 6 }),
    ]).start();

    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      speed: 18,
      bounciness: 4,
    }).start();
  };

  const maxHeight = expandAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 260],
  });

  const detailOpacity = expandAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        cardStyles.entryWrap,
        {
          opacity:   entryAnim,
          transform: [{
            translateY: entryAnim.interpolate({
              inputRange:  [0, 1],
              outputRange: [24, 0],
            }),
          }],
        },
      ]}
    >
      {/* Outer glow bubble */}
      <Animated.View
        style={[
          cardStyles.glowBubble,
          {
            backgroundColor: item.color.glow,
            transform: [{ scale: glowAnim }],
          },
        ]}
        pointerEvents="none"
      />

      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View
          style={[
            cardStyles.card,
            {
              borderColor:     item.color.solid,
              backgroundColor: item.color.dim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Top highlight line */}
          <View style={[cardStyles.topLine, { backgroundColor: item.color.solid }]} />

          {/* Card header row */}
          <View style={cardStyles.header}>
            <View style={[cardStyles.iconBubble, { backgroundColor: item.color.dim, borderColor: item.color.solid }]}>
              <Text style={[cardStyles.iconText, { color: item.color.solid }]}>{item.icon}</Text>
            </View>

            <View style={cardStyles.titleBlock}>
              <View style={cardStyles.numRow}>
                <Text style={[cardStyles.numLabel, { color: item.color.solid }]}>#{item.id}</Text>
              </View>
              <Text style={cardStyles.title}>{item.title}</Text>
              <Text style={cardStyles.tagline}>{item.tagline}</Text>
            </View>

            <View style={[cardStyles.chevron, expanded && cardStyles.chevronExpanded]}>
              <Text style={[cardStyles.chevronText, { color: item.color.solid }]}>
                {expanded ? '▲' : '▼'}
              </Text>
            </View>
          </View>

          {/* Benefit pill */}
          <View style={[cardStyles.benefitPill, { backgroundColor: item.color.dim, borderColor: item.color.solid }]}>
            <Text style={[cardStyles.benefitText, { color: item.color.solid }]} numberOfLines={1}>
              ✦ {item.benefit}
            </Text>
          </View>

          {/* Expandable detail */}
          <Animated.View style={[cardStyles.expandable, { maxHeight }]}>
            <Animated.View style={{ opacity: detailOpacity }}>
              <View style={cardStyles.divider} />

              <Text style={cardStyles.descText}>{item.description}</Text>

              <Text style={[cardStyles.examplesLabel, { color: item.color.solid }]}>Use Cases</Text>
              <View style={cardStyles.tagsRow}>
                {item.examples.map(ex => (
                  <View
                    key={ex}
                    style={[cardStyles.tag, { backgroundColor: item.color.dim, borderColor: item.color.solid }]}
                  >
                    <Text style={[cardStyles.tagText, { color: item.color.solid }]}>{ex}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  entryWrap: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  glowBubble: {
    position:     'absolute',
    width:        120,
    height:       120,
    borderRadius: 60,
    top:          -20,
    right:        -20,
    opacity:      0.12,
  },
  card: {
    borderRadius: radius['2xl'],
    borderWidth:  1,
    overflow:     'hidden',
  },
  topLine: {
    height:          1,
    opacity:         0.7,
    marginHorizontal: spacing.base,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        spacing.base,
    paddingBottom:  spacing.sm,
  },
  iconBubble: {
    width:           46,
    height:          46,
    borderRadius:    radius['2xl'],
    borderWidth:     1,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     spacing.md,
    flexShrink:      0,
  },
  iconText: {
    fontSize:   20,
    lineHeight: 24,
  },
  titleBlock: {
    flex: 1,
  },
  numRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  2,
  },
  numLabel: {
    ...typography.label,
    letterSpacing: 1,
  },
  title: {
    ...typography.headline,
    color:       colors.text.primary,
    marginBottom: 2,
  },
  tagline: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chevron: {
    width:          28,
    height:         28,
    alignItems:     'center',
    justifyContent: 'center',
    marginLeft:     spacing.sm,
  },
  chevronExpanded: {
    opacity: 0.85,
  },
  chevronText: {
    fontSize:   11,
  },
  benefitPill: {
    marginHorizontal: spacing.base,
    marginBottom:     spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical:  spacing.xxs + 2,
    borderRadius:     radius.full,
    borderWidth:      1,
    alignSelf:        'flex-start',
  },
  benefitText: {
    ...typography.caption,
    fontWeight: '600',
  },
  expandable: {
    overflow: 'hidden',
  },
  divider: {
    height:          1,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.base,
    marginBottom:    spacing.md,
  },
  descText: {
    ...typography.bodySmall,
    color:           colors.text.secondary,
    marginHorizontal: spacing.base,
    marginBottom:    spacing.md,
  },
  examplesLabel: {
    ...typography.label,
    marginHorizontal: spacing.base,
    marginBottom:    spacing.sm,
  },
  tagsRow: {
    flexDirection:   'row',
    flexWrap:        'wrap',
    paddingHorizontal: spacing.base,
    paddingBottom:   spacing.base,
    gap:             spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical:  spacing.xxs + 1,
    borderRadius:    radius.full,
    borderWidth:     1,
  },
  tagText: {
    ...typography.caption,
    fontWeight: '500',
  },
});

// ─── Category Filter Chip ───────────────────────────────────────────────────

const FilterChip: React.FC<{
  label:     string;
  icon:      string;
  active:    boolean;
  onPress:   () => void;
}> = ({ label, icon, active, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true, speed: 60, bounciness: 4 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 8 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View
        style={[
          chipStyles.chip,
          active ? chipStyles.chipActive : chipStyles.chipInactive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[chipStyles.chipIcon, active && chipStyles.chipIconActive]}>{icon}</Text>
        <Text style={[chipStyles.chipLabel, active && chipStyles.chipLabelActive]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius:    radius.full,
    borderWidth:     1,
    marginRight:     spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.brand.primaryDim,
    borderColor:     colors.brand.primary,
  },
  chipInactive: {
    backgroundColor: colors.glass.light,
    borderColor:     colors.border.light,
  },
  chipIcon: {
    fontSize:    11,
    color:       colors.text.tertiary,
    marginRight: spacing.xs,
  },
  chipIconActive: {
    color: colors.brand.primary,
  },
  chipLabel: {
    ...typography.caption,
    color:      colors.text.tertiary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.brand.primary,
  },
});

// ─── Hero stats bar ─────────────────────────────────────────────────────────

const HeroStat: React.FC<{ value: string; label: string; color: string }> = ({ value, label, color }) => (
  <View style={heroStyles.stat}>
    <Text style={[heroStyles.statValue, { color }]}>{value}</Text>
    <Text style={heroStyles.statLabel}>{label}</Text>
  </View>
);

const heroStyles = StyleSheet.create({
  stat: {
    alignItems: 'center',
    flex:       1,
  },
  statValue: {
    ...typography.title2,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color:     colors.text.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

export const VisionScreen: React.FC = () => {
  const navigation         = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');

  const headerOpacity  = useRef(new Animated.Value(0)).current;
  const heroGlow       = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue:  1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(heroGlow, { toValue: 1.2, duration: 3000, useNativeDriver: true }),
        Animated.timing(heroGlow, { toValue: 0.7, duration: 3000, useNativeDriver: true }),
      ]),
    ).start();
  }, [headerOpacity, heroGlow]);

  const filtered = activeFilter === 'all'
    ? USE_CASES
    : USE_CASES.filter(uc => uc.category === activeFilter);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.base} />

      {/* ── Header ──────────────────────────────────────────── */}
      <Animated.View style={[styles.headerWrap, { opacity: headerOpacity }]}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>UNIVERSAL TRUST WALLET</Text>
          <Text style={styles.headerTitle}>Global Vision</Text>
        </View>

        {/* Decorative orb */}
        <Animated.View
          style={[styles.headerOrb, { transform: [{ scale: heroGlow }] }]}
          pointerEvents="none"
        />
      </Animated.View>

      {/* ── Hero card ───────────────────────────────────────── */}
      <Animated.View style={[styles.heroCard, shadows.glowPrimary, { opacity: headerOpacity }]}>
        <View style={[styles.heroTopLine, { backgroundColor: colors.brand.primary }]} />
        <Text style={styles.heroHeadline}>
          One wallet. Every trust interaction on Earth.
        </Text>
        <Text style={styles.heroSub}>
          20 global use-cases that reshape identity, commerce, governance, and truth.
        </Text>
        <View style={styles.heroStats}>
          <HeroStat value="20" label="Use Cases"   color={colors.brand.primary} />
          <View style={styles.heroStatDivider} />
          <HeroStat value="8"  label="Categories"  color={colors.trust.verified.solid} />
          <View style={styles.heroStatDivider} />
          <HeroStat value="∞"  label="Trust Events" color={colors.trust.pending.solid} />
        </View>
      </Animated.View>

      {/* ── Category filters ────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filters}
      >
        {CATEGORY_FILTERS.map(f => (
          <FilterChip
            key={f.key}
            label={f.label}
            icon={f.icon}
            active={activeFilter === f.key}
            onPress={() => setActiveFilter(f.key)}
          />
        ))}
      </ScrollView>

      {/* ── Use-case cards ──────────────────────────────────── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: TAB_BAR_CLEARANCE }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section counter */}
        <Text style={styles.countLabel}>
          {filtered.length} use {filtered.length === 1 ? 'case' : 'cases'}
          {activeFilter !== 'all' ? ` · ${CATEGORY_FILTERS.find(f => f.key === activeFilter)?.label}` : ''}
        </Text>

        {filtered.map((item, index) => (
          <UseCaseCard key={item.id} item={item} index={index} />
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Screen styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg.base,
  },

  // Header
  headerWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingTop:      Platform.OS === 'ios' ? 56 : 36,
    paddingBottom:   spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.bg.overlay,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    overflow:        'visible',
  },
  backBtn: {
    width:           36,
    height:          36,
    borderRadius:    radius.full,
    backgroundColor: colors.glass.medium,
    borderWidth:     1,
    borderColor:     colors.border.light,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     spacing.md,
    zIndex:          2,
  },
  backIcon: {
    fontSize:   18,
    color:      colors.text.primary,
    lineHeight: 22,
  },
  headerCenter: {
    flex: 1,
  },
  headerLabel: {
    ...typography.label,
    color: colors.brand.primary,
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.text.primary,
  },
  headerOrb: {
    position:     'absolute',
    right:        spacing.base,
    top:          Platform.OS === 'ios' ? 40 : 20,
    width:        80,
    height:       80,
    borderRadius: 40,
    backgroundColor: colors.brand.primaryDim,
    opacity:      0.4,
  },

  // Hero card
  heroCard: {
    marginHorizontal: spacing.base,
    marginTop:        spacing.base,
    borderRadius:     radius['2xl'],
    borderWidth:      1,
    borderColor:      colors.brand.primary,
    backgroundColor:  colors.brand.primaryDim,
    overflow:         'hidden',
  },
  heroTopLine: {
    height:          1,
    opacity:         0.8,
    marginHorizontal: spacing.base,
  },
  heroHeadline: {
    ...typography.title3,
    color:           colors.text.primary,
    margin:          spacing.base,
    marginBottom:    spacing.xs,
  },
  heroSub: {
    ...typography.bodySmall,
    color:            colors.text.secondary,
    marginHorizontal: spacing.base,
    marginBottom:     spacing.md,
  },
  heroStats: {
    flexDirection:   'row',
    alignItems:      'center',
    borderTopWidth:  1,
    borderTopColor:  colors.border.subtle,
    paddingVertical: spacing.md,
  },
  heroStatDivider: {
    width:           1,
    height:          32,
    backgroundColor: colors.border.subtle,
  },

  // Filters
  filters: {
    marginTop:    spacing.md,
    flexGrow:     0,
    flexShrink:   0,
  },
  filtersContent: {
    paddingHorizontal: spacing.base,
    paddingBottom:     spacing.sm,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop:        spacing.base,
  },
  countLabel: {
    ...typography.caption,
    color:         colors.text.tertiary,
    marginBottom:  spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default VisionScreen;
