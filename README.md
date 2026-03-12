This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
# Sovereign Trust Passport

Sovereign Trust Passport is a **hardware-secured digital identity wallet** built using React Native.

The application acts as a **universal trust verification system** that allows users to verify:

• identities  
• credentials  
• product authenticity  
• documents  
• supply chains  
• social claims  

Core user experience:

**Scan → Verify → Trust**

The system hides complex cryptography and exposes a simple consumer interface similar to:

Apple Wallet  
UPI QR scanning  
Modern fintech apps

---

# Critical Security Notice

The following components are **already implemented and working** and must **never be modified unless required**:


ios/
Podfile
AppDelegate
Face ID configuration
Secure Enclave integration
src/crypto/hardwareKey.ts


Face ID must **only be triggered via explicit user interaction**.

Do not automatically trigger biometric prompts on screen load.

---

# Technology Stack

React Native  
TypeScript  
React Navigation  
SQLite  
Secure Enclave / StrongBox  
QR scanning  
Local verification engines

The system uses a **domain-driven architecture**.

---

# Layered Architecture

UI Layer


src/screens


Business Logic


src/domain


Infrastructure Layer


src/services


Persistence


src/database


Security


src/crypto


---

# Complete Project Structure


src
├── app
│ ├── AppNavigator.tsx
│ ├── routes.ts
│ └── providers
│ └── AppProviders.tsx
│
├── components
│ └── common
│ ├── AppHeader.tsx
│ ├── AppButton.tsx
│ ├── AppCard.tsx
│ ├── AppBadge.tsx
│ ├── AppSectionTitle.tsx
│ ├── EmptyState.tsx
│ └── LoadingState.tsx
│
├── constants
│ ├── appConstants.ts
│ ├── mockData.ts
│ ├── issuerDirectory.ts
│ └── productCatalog.ts
│
├── crypto
│ ├── biometricTest.ts
│ ├── hardwareKey.ts
│ └── signatures.ts
│
├── database
│ ├── sqlite
│ │ ├── db.ts
│ │ ├── schema.ts
│ │ ├── migrations.ts
│ │ └── seed.ts
│ │
│ └── repositories
│ ├── credentialRepository.ts
│ ├── issuerRepository.ts
│ ├── productRepository.ts
│ ├── postRepository.ts
│ └── handshakeRepository.ts
│
├── domain
│ ├── credentials
│ ├── handshake
│ ├── identity
│ ├── products
│ ├── truth
│ └── verification
│ ├── verificationEngine.ts
│ ├── verificationRouter.ts
│ ├── verificationResult.ts
│ └── verificationTypes.ts
│
├── hooks
│ ├── useBiometricAuth.ts
│ ├── useHandshakeFlow.ts
│ ├── useCredentialStore.ts
│ ├── useProductVerification.ts
│ └── useTruthFeed.ts
│
├── models
│ ├── credential.ts
│ ├── issuer.ts
│ ├── product.ts
│ ├── post.ts
│ ├── handshake.ts
│ └── verification.ts
│
├── screens
│ ├── home
│ │ ├── HomeScreen.tsx
│ │ └── sections
│ │
│ ├── passport
│ │ ├── PassportScreen.tsx
│ │ └── components
│ │
│ ├── verify
│ │ ├── VerifyScreen.tsx
│ │ └── components
│ │
│ ├── scan
│ │ ├── ScanScreen.tsx
│ │ └── components
│ │
│ ├── handshake
│ │ ├── HandshakeScreen.tsx
│ │ └── components
│ │
│ ├── truthFeed
│ │ ├── TruthFeedScreen.tsx
│ │ └── components
│ │
│ ├── products
│ │ └── components
│ │
│ ├── credentials
│ │ └── components
│ │
│ └── settings
│ └── components
│
├── services
│ ├── ai
│ │ └── fraudSignalService.ts
│ │
│ ├── biometric
│ │ └── biometricService.ts
│ │
│ ├── credentials
│ │ ├── credentialStoreService.ts
│ │ ├── credentialVerificationService.ts
│ │ └── revocationService.ts
│ │
│ ├── identity
│ │ ├── didService.ts
│ │ ├── issuerDirectoryService.ts
│ │ └── verifierService.ts
│ │
│ ├── products
│ │ ├── productRegistryService.ts
│ │ ├── productVerificationService.ts
│ │ └── custodyService.ts
│ │
│ ├── qr
│ │ ├── qrParserService.ts
│ │ └── qrGeneratorService.ts
│ │
│ └── truth
│ ├── truthFeedService.ts
│ └── postVerificationService.ts
│
├── theme
│ ├── colors.ts
│ ├── spacing.ts
│ ├── typography.ts
│ ├── shadows.ts
│ └── radius.ts
│
└── utils


---

# Core Product Capabilities

## Identity Wallet

User DID  
Credential storage  
Issuer verification  
Credential sharing

## Verification Engine

Credential verification  
Product authenticity verification  
Document validation  
Post authenticity validation

## QR Scan System

Scan credential QR  
Scan product authenticity QR  
Scan login challenge QR

## Trust Handshake

Passwordless login  
Challenge response authentication  
Biometric signature

## Product Authenticity

Manufacturer verification  
Supply chain checkpoints  
Chain of custody

## Truth Feed

Verify posts  
Verify authors  
Verify institutions

## Manual Verification

Some real world roles cannot be automatically verified.

The system supports:

Manually verified identity  
Manually verified institutions  
Manually verified roles

These are issued as **verifiable credentials** by trusted issuers.

---

# Developer Rules

When generating code using AI:

Do not create new root folders.

Use the existing architecture.

Implement logic inside the correct layer:

UI → screens  
Logic → domain  
Infrastructure → services  
Storage → database  
Security → crypto

Prefer **many small files instead of large files**.

---

# Product Vision

The long term goal is to build a **global trust layer**.

Anyone should be able to:

**scan anything important in life and instantly know if it is real.**

Examples:

people  
products  
documents  
certificates  
credentials  
ownership  
social claims  

The backend sophistication should remain invisible.

The user experience should feel simple and magical.
# AI Development Protocol

This project is developed using AI-assisted engineering.

AI systems such as Claude may generate code for this repository.

All AI systems must follow these rules.

## Architecture Rules

Follow the project architecture exactly as defined in this README.

Do not create new root folders.

Work only inside the existing structure:

src/app
src/components
src/constants
src/crypto
src/database
src/domain
src/hooks
src/models
src/screens
src/services
src/theme
src/utils

## Layer Responsibilities

screens → user interface

domain → business logic

services → infrastructure

database → persistence

crypto → security

## Security Rules

Do not modify the following without explicit instruction:

ios/
Podfile
AppDelegate
Face ID configuration
Secure Enclave logic

All cryptographic signing must use the existing secure flow.

## File Rules

Prefer many small files rather than large files.

Do not rename existing files.

Do not move files across layers.

## UI Philosophy

User experience must feel:

simple
premium
trustworthy
fast

The system hides complex verification logic behind a minimal interface.

The product should feel similar to:

Apple Wallet
Stripe mobile apps
Modern banking apps

## Product Goal

Anyone should be able to:

scan anything important in life and instantly know if it is real.
