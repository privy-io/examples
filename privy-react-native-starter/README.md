# Privy + React Native Starter

This example shows how to integrate [`@privy-io/expo`](https://docs.privy.io/basics/react-native/setup) into a bare React Native 0.81 app without Expo Router or the managed Expo workflow. It includes email, SMS, and Google OAuth login flows using Privy Elements.

## Getting Started

### 1. Clone the project

```bash
mkdir -p privy-react-native-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-react-native-starter examples-main/privy-react-native-starter && cd privy-react-native-starter
```

### 2. Install dependencies

```bash
corepack enable
pnpm install
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Configure Privy

Create a mobile client in the [Privy Dashboard](https://dashboard.privy.io/apps?page=settings&setting=clients) and update the credentials in [`App.tsx`](./App.tsx):

```ts
const PRIVY_APP_ID = '<your-app-id>';
const PRIVY_CLIENT_ID = '<your-client-id>';
```

The starter is checked in with these native defaults:

```text
iOS bundle identifier: dev.privy.reactnativestarter
Android application ID: dev.privy.reactnativestarter
App URL scheme: privyreactnative
```

If you change those values for your own app, make sure your Privy mobile client matches:

- iOS bundle identifier in [`ios/PrivyReactNativeStarter.xcodeproj/project.pbxproj`](./ios/PrivyReactNativeStarter.xcodeproj/project.pbxproj)
- Android application ID in [`android/app/build.gradle`](./android/app/build.gradle)
- URL schemes in [`ios/PrivyReactNativeStarter/Info.plist`](./ios/PrivyReactNativeStarter/Info.plist) and [`android/app/src/main/AndroidManifest.xml`](./android/app/src/main/AndroidManifest.xml)

### 4. Start development

Start Metro in one terminal:

```bash
pnpm start
```

Then run the native app in a second terminal:

```bash
pnpm ios
# or
pnpm android
```

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built mobile UI.

[`App.tsx`](./App.tsx)

```tsx
import {useLogin} from '@privy-io/expo/ui';

const {login} = useLogin();
login({loginMethods: ['email']});
```

### 2. Launch Google OAuth

Use the native OAuth flow exposed by the React Native SDK.

[`App.tsx`](./App.tsx)

```tsx
import {useLoginWithOAuth} from '@privy-io/expo';

const {login} = useLoginWithOAuth();
login({provider: 'google'});
```

## Key Files

| File | Purpose |
| --- | --- |
| `index.js` | Registers the app and loads the polyfills Privy depends on |
| `App.tsx` | Configures `PrivyProvider` and renders login or authenticated states |
| `metro.config.js` | Enables the module-resolution overrides needed by Privy dependencies |
| `android/app/src/main/AndroidManifest.xml` | Defines the Android deep-link scheme used by the app |
| `ios/PrivyReactNativeStarter/AppDelegate.swift` | Boots the Expo-backed React Native host in the bare iOS app |

## Notes

- The import order in [`index.js`](./index.js) matters: `fast-text-encoding`, then `react-native-get-random-values`, then `@ethersproject/shims`.
- If Xcode cannot find Node, create `ios/.xcode.env.local` with `export NODE_BINARY=$(command -v node)`.
- This starter intentionally pins Expo SDK 54-compatible modules because `@privy-io/expo` relies on Expo native modules even in a bare React Native app.

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React Native setup guide](https://docs.privy.io/basics/react-native/setup)
- [React Native documentation](https://reactnative.dev/)
