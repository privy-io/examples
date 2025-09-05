# Shared Components

This directory contains reusable UI components that can be copied and pasted into React-based Privy examples.

## Philosophy

Following the design document's recommendation, these components are designed to be **copy-pasted** rather than imported as dependencies. This approach:

- ✅ Makes examples self-contained and easier to clone
- ✅ Allows customization without breaking other examples  
- ✅ Reduces complexity and maintenance overhead
- ✅ Ensures examples work independently

## Usage

1. **Copy the component files** you need from this directory
2. **Paste them into your example's components folder**
3. **Customize as needed** for your specific use case

## Available Components

### Core Components
- `ConnectButton.tsx` - Standard Privy connect/disconnect button
- `LoginCard.tsx` - Authentication card with Privy branding
- `WalletInfo.tsx` - Display connected wallet information
- `UserProfile.tsx` - Show authenticated user details

### Layout Components  
- `Header.tsx` - App header with Privy branding
- `Footer.tsx` - Consistent footer across examples
- `Layout.tsx` - Main layout wrapper

### Feature Components
- `SignMessageCard.tsx` - "Hello World" sign message component
- `TransactionButton.tsx` - Send transaction with Privy
- `SmartWalletControls.tsx` - Smart wallet specific actions

## Design System

All components follow consistent:
- **Colors**: Privy brand colors and design tokens
- **Typography**: Consistent font sizes and weights  
- **Spacing**: Standard padding and margin scales
- **Styling**: Tailwind CSS classes for consistency

## Contributing

When adding new shared components:

1. Follow the existing naming conventions
2. Include TypeScript definitions
3. Add comprehensive JSDoc comments
4. Ensure components are framework-agnostic where possible
5. Update this README with component descriptions