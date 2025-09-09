//
//  PrivySDKTestApp.swift
//  PrivySDKTestApp
//
//  Created by Kyle Chamberlain on 1/16/24.
//

import SwiftUI

@main
struct PrivySDKTestApp: App {
    let authManager = Auth0Manager()
    let privyManager: PrivyManager
    init() {
        privyManager = PrivyManager(authManager: authManager)
    }
    var body: some Scene {
        WindowGroup {
            WalletView(
                authManager: authManager,
                privyManager: privyManager
            )
        }
    }
}
