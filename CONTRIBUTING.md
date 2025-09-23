# Contributing to Privy Examples

This collection showcases various integrations and use cases around Privy.

## What We're Looking For

We welcome community examples showcasing **Privy integrations** with:

- **New Frameworks** (Vue, Svelte, Angular, Flutter, etc.)
- **Blockchain Integrations** (Tron, Bitcoin, Base, Arbitrum, etc.)
- **DeFi & Web3 Protocols** (Uniswap, Aave, NFT marketplaces, gaming)
- **Advanced Features** (Account abstraction, cross-chain, gasless transactions)
- **Mobile & Backend** (React Native, Node.js, Python, webhooks)
- **Developer Tools** (CLI tools, testing utilities, deployment scripts)

## Before You Start

1. **Check Existing Examples**: Review the [README.md](./README.md) to ensure your idea isn't already covered
2. **Choose Your Starting Point**: You can either:
   - Use an existing Privy template (`privy-next-starter/`, `privy-react-starter/`, etc.) as your base
   - Build from scratch following our structure patterns
3. **Follow the Structure**: Use our established patterns for consistency

**Optional**: If you want to request a specific example or discuss a complex integration before building, feel free to open an issue first.

## Repository Structure

```
# Official Privy examples (maintained by Privy team)
privy-next-starter/
privy-react-starter/
privy-expo-starter/
examples/
├── privy-next-farcaster/
├── privy-react-funding/
└── ...

# Community contributions go here
community-maintained-examples/
├── {framework}-{usecase}/               # Your example directory
│   ├── README.md                         # Setup and usage instructions
│   ├── package.json                      # Dependencies and scripts
│   ├── .env.example                      # Environment variable template
│   ├── src/                             # Source code
│   └── public/                          # Static assets (if applicable)
└── ...
```

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/examples.git
```

### 2. Create Your Example

```bash
# Option A: Copy an existing Privy template as starting point
cp -r privy-next-starter community-maintained-examples/{framework}-{usecase}
cd community-maintained-examples/{framework}-{usecase}

# Option B: Create from scratch
mkdir community-maintained-examples/{framework}-{usecase}
cd community-maintained-examples/{framework}-{usecase}
```

### 3. Example Naming Convention

Use this pattern: `{framework}-{usecase/feature/integration}`

**Good Examples:**

- `vue-smart-wallets`
- `svelte-farcaster-integration`
- `angular-permissionless`
- `node-webhook-handler`
- `python-analytics-dashboard`
- `flutter-defi-wallet`

**Avoid:**

- Generic names like `example` or `test-app`
- Overly long names with multiple features
- Using "privy-" prefix (reserved for official examples)

## Example Requirements

### Mandatory Files

#### 1. README.md Template

**Follow the exact structure used in official Privy examples** (see `privy-next-starter/`, `privy-react-whitelabel-starter/`, etc.).

Your README should include these sections:

```markdown
# {Framework} {Feature} Example

Brief description of what this example demonstrates and its key value proposition.

## Live Demo (if applicable)

[View Demo](https://your-demo-url.com/)

## Getting Started

### 1. Clone the Project

    git clone https://github.com/privy-io/examples.git
    cd community-maintained-examples/{framework}-{usecase}

### 2. Install Dependencies

    npm install

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

    cp .env.example .env.local

Update `.env.local` with your Privy app credentials:

    # Public - Safe to expose in the browser
    NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
    # Add other environment variables as needed

**Important:** Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

### 4. Configure Dashboard Settings (if needed)

1. Enable desired login methods in the [Privy Dashboard](https://dashboard.privy.io/apps?page=login-methods)
2. [Optional] Enable guest accounts under Settings > Advanced settings > Guest accounts
3. [Optional] Configure any additional settings specific to your example

### 5. Start Development Server

    npm run dev

## Core Functionality

Brief explanation of key features and implementation details with code snippets when helpful.

## Learn More

- [Privy Documentation](https://docs.privy.io)
- [Framework-specific Documentation]
- [Integration-specific Documentation]
```

#### 2. .env.example File

Always include an `.env.example` with necessary environment variables:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-app-id-here

# Additional variables as needed
# NEXT_NEYNAR_API_KEY=
```

### Code Quality Standards

1. **TypeScript First**: Use TypeScript when possible
2. **Modern Practices**: Use latest framework patterns and best practices
3. **Clean Code**: Meaningful variable names, proper comments, modular structure
4. **Error Handling**: Implement proper error boundaries and user feedback

## Testing Your Example

Before submitting:

1. **Fresh Installation Test**: Clone your example in a clean environment
2. **Environment Setup**: Verify `.env.example` contains all required variables
3. **Documentation Accuracy**: Follow your README step-by-step
4. **Cross-Platform Testing**: Test on different operating systems if possible
5. **Mobile Testing**: Verify mobile responsiveness for web applications

## Submission Process

### 1. Create a Pull Request

```bash
# Create a new branch
git checkout -b feature/{framework}-{usecase}

# Add your files
git add community-maintained-examples/{framework}-{usecase}/

# Commit with descriptive message
git commit -m "Add {framework}-{usecase} example

- Brief description of what it demonstrates
- Key features implemented
- Any notable technical details"

# Push to your fork
git push origin feature/{framework}-{usecase}
```

### 2. Pull Request Template

When creating your PR, use our standard template (automatically loaded) that includes:

- Description of your example
- Type of integration/feature
- Framework and blockchain details
- Testing checklist
- Whether you used an existing Privy template as a base

The template ensures all necessary information is provided for efficient review.

### 3. Review Process

Your PR will be reviewed for:

- **Functionality**: Does the example work as described?
- **Documentation**: Is the setup process clear and complete?
- **Code Quality**: Does it follow best practices?
- **Security**: Are there any security concerns?
- **Consistency**: Does it match our repository patterns?

## Feature Requests

Have an idea for a new example?

1. **Check existing examples** to avoid duplicates
2. **Open an issue** with:
   - Clear description of the proposed example
   - Target framework and blockchain
   - Key features to demonstrate
   - Potential use cases
   - Why it would be valuable to the community

## Resources

### Privy Documentation

- [Privy Docs](https://docs.privy.io)
- [React SDK Reference](https://docs.privy.io/reference/react-auth)
- [Node SDK Reference](https://docs.privy.io/reference/server-auth)

### Development Tools

- [Privy Dashboard](https://dashboard.privy.io)
- [Canonical Starters](./)

## Questions?

- **Slack**: [Privy Developer Slack](https://privy.io/slack)

---
