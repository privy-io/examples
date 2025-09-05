//
//  HiddenModifier.swift
//  PrivySDKTestApp
//
//  Created by Dalu Udeogu on 2023-12-11.
//

import SwiftUI

/// A modifier that hides a view if the condition is met, otherwise it the view is shown.
private struct HiddenModifier: ViewModifier {
    let condition: Bool
    
    func body(content: Content) -> some View {
        content.modifier(if: condition) { content in
            content.hidden()
        } else: { content in
            content
        }
    }
}

public extension View {
    /// Hides this view conditionally.
    ///
    /// - Parameter condition: The condition to determine if the content should be applied.
    /// - Returns: The modified view.
    func hidden(_ condition: Bool) -> some View {
        modifier(HiddenModifier(condition: condition))
    }
}
