//
//  SpinnerView.swift
//  PrivySDKTestApp
//
//  Created by Dalu Udeogu on 2023-12-11.
//

import SwiftUI

struct SpinnerView: View {
    var tint: Color = .accentColor
    var size: CGFloat = 20
    var disabled = false
    @State private var isAnimating = false
    
    var body: some View {
        Circle()
            .trim(from: 0, to: 0.8)
            .stroke(style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
            .foregroundColor(tint.opacity(disabled ? 0.5 : 1))
            .rotationEffect(Angle(degrees: isAnimating ? 360 : 0), anchor: .center)
            .animation(.linear(duration: 0.8).repeatForever(autoreverses: false), value: isAnimating)
            .frame(width: size, height: size)
            .onAppear {
                DispatchQueue.main.async {
                    self.isAnimating = true
                }
            }
    }
}

// MARK: - Extensions

extension View {
    /// Adds a progress view over this view if the condition is met, otherwise it no progress view is shown.
    ///
    /// - Parameter condition: The condition to determine if the content should be applied.
    /// - Returns: The modified view.
    func progress(
        if condition: Bool = true,
        tint: SwiftUI.Color = .white
    ) -> some View {
        overlay(
            Group {
                if condition {
                    SpinnerView(tint: tint)
                }
            }
        )
    }
}

struct SpinnerView_Previews: PreviewProvider {
    static var previews: some View {
        SpinnerView()
        ZStack {
            SpinnerView()
        }
    }
}

