//
//  PrimaryButtonStyle.swift
//  PrivySDKTestApp
//
//  Created by Dalu Udeogu on 2023-12-11.
//

import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    @Binding var isLoading: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity)
            .hidden(isLoading)
            .padding()
            .background(Color(.sRGB, red: 51/255, green: 51/255, blue: 51/255, opacity: 1))
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 5))
            .disabled(isLoading)
            .progress(if: isLoading)
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var primary: Self { .primary() }
    
    static func primary(isLoading: Binding<Bool> = .constant(false)) -> Self {
        PrimaryButtonStyle(isLoading: isLoading)
    }
}
