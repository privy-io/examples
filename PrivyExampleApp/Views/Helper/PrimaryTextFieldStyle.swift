//
//  PrimaryTextFieldStyle.swift
//  PrivySDKTestApp
//
//  Created by Dalu Udeogu on 2023-12-11.
//

import SwiftUI

struct PrimaryTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<_Label>) -> some View {
        configuration
            .padding()
            .border(Color(.sRGB, red: 68/255, green: 68/255, blue: 68/255, opacity: 1), width: 1)
            .cornerRadius(5)
    }
}
