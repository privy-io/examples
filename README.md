# Privy + Auth0 iOS example app

This app demonstrates the usage of the PrivySDK alongside Auth0 as a
[custom auth provider](https://docs.privy.io/guide/guides/swift-sdk#login-with-custom-authentication)

### Running

In order to run this app you'll need:

1. A valid Privy `appId` used @
   [PrivyExampleApp/PrivyManager.swift](PrivyExampleApp/PrivyManager.swift#L32)

1. A few values from the your `Auth0` account
   - `clientId` used @
     [PrivyExampleApp/Auth0.plist](PrivyExampleApp/Auth0.plist)
   - `domain` used @ [PrivyExampleApp/Auth0.plist](PrivyExampleApp/Auth0.plist)
   - `audience` used @
     [PrivyExampleApp/Auth0Manager.swift](PrivyExampleApp/Auth0Manager.swift#L22)

### SDK Usage Guide

See Privy's [iOS SDK guide](https://docs.privy.io/guide/guides/swift-sdk) for
setup and usage.
