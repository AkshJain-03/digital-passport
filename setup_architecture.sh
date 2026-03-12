#!/bin/bash

echo "Cleaning duplicate architecture..."

# remove old feed folder (logic moved to domain/truth)
rm -rf src/feed

# remove legacy handshake folder (logic belongs in domain)
rm -rf src/handshake

# remove legacy credentials folder
rm -rf src/credentials

echo "Creating required folder structure..."

mkdir -p src/app/providers

mkdir -p src/components/common

mkdir -p src/constants

mkdir -p src/hooks

mkdir -p src/models

mkdir -p src/utils

mkdir -p src/theme

mkdir -p src/database/sqlite
mkdir -p src/database/repositories

mkdir -p src/services/ai
mkdir -p src/services/biometric
mkdir -p src/services/credentials
mkdir -p src/services/identity
mkdir -p src/services/products
mkdir -p src/services/qr
mkdir -p src/services/truth

mkdir -p src/domain/verification
mkdir -p src/domain/identity
mkdir -p src/domain/credentials
mkdir -p src/domain/products
mkdir -p src/domain/truth
mkdir -p src/domain/handshake

mkdir -p src/screens/home/sections
mkdir -p src/screens/passport/components
mkdir -p src/screens/verify/components
mkdir -p src/screens/scan/components
mkdir -p src/screens/handshake/components
mkdir -p src/screens/truthFeed/components
mkdir -p src/screens/products/components
mkdir -p src/screens/credentials/components
mkdir -p src/screens/settings/components

echo "Creating required files..."

touch src/app/AppNavigator.tsx
touch src/app/routes.ts
touch src/app/providers/AppProviders.tsx

touch src/theme/colors.ts
touch src/theme/spacing.ts
touch src/theme/typography.ts
touch src/theme/shadows.ts
touch src/theme/radius.ts

touch src/components/common/AppHeader.tsx
touch src/components/common/AppButton.tsx
touch src/components/common/AppCard.tsx
touch src/components/common/AppBadge.tsx
touch src/components/common/AppSectionTitle.tsx
touch src/components/common/EmptyState.tsx
touch src/components/common/LoadingState.tsx

touch src/hooks/useBiometricAuth.ts
touch src/hooks/useHandshakeFlow.ts
touch src/hooks/useCredentialStore.ts
touch src/hooks/useProductVerification.ts
touch src/hooks/useTruthFeed.ts

touch src/services/biometric/biometricService.ts
touch src/services/identity/didService.ts
touch src/services/identity/issuerDirectoryService.ts
touch src/services/identity/verifierService.ts

touch src/services/credentials/credentialStoreService.ts
touch src/services/credentials/credentialVerificationService.ts
touch src/services/credentials/revocationService.ts

touch src/services/products/productRegistryService.ts
touch src/services/products/productVerificationService.ts
touch src/services/products/custodyService.ts

touch src/services/truth/truthFeedService.ts
touch src/services/truth/postVerificationService.ts

touch src/services/qr/qrParserService.ts
touch src/services/qr/qrGeneratorService.ts

touch src/services/ai/fraudSignalService.ts

touch src/database/sqlite/db.ts
touch src/database/sqlite/schema.ts
touch src/database/sqlite/migrations.ts
touch src/database/sqlite/seed.ts

touch src/database/repositories/credentialRepository.ts
touch src/database/repositories/issuerRepository.ts
touch src/database/repositories/productRepository.ts
touch src/database/repositories/postRepository.ts
touch src/database/repositories/handshakeRepository.ts

touch src/models/credential.ts
touch src/models/issuer.ts
touch src/models/product.ts
touch src/models/post.ts
touch src/models/handshake.ts
touch src/models/verification.ts

touch src/constants/appConstants.ts
touch src/constants/mockData.ts
touch src/constants/issuerDirectory.ts
touch src/constants/productCatalog.ts

echo "Architecture ready."
