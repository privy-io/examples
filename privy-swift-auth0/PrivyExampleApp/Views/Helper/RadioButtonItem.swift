//
//  RadioButtonItem.swift
//  PrivySDKTestApp
//
//  Created by Dalu Udeogu on 2023-12-11.
//

import SwiftUI
import PrivySDK

struct RadioButtonItem: View {
    let chain: SupportedChain
    @Binding var selectedNetwork: SupportedChain
    
    var body: some View {
        Button {
            self.selectedNetwork = self.chain
        } label: {
            Text(chain.name)
                .padding()
                .foregroundColor(.white)
                .background(selectedNetwork == chain ? .green : .gray)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.white))
        }
    }
}
