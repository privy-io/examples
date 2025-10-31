# Contributing to Privy Examples

## Quick Commands

```bash
pnpm sync:apply              # Sync base changes to examples
pnpm create-example          # Create new example from a base starter
pnpm check-drift             # See what's out of sync
```

---

## What Are You Doing?

### 📝 Updating Base Starter Components

You fixed a bug or updated UI in a base starter (e.g., `privy-next-starter`).

```bash
# 1. Make your changes in base
cd privy-next-starter
# Edit files, test locally

# 2. Sync to all examples
cd ..
pnpm sync:apply
```

**Added new dependencies?** Sync them manually:

```bash
for dir in examples/privy-next-*; do
  (cd "$dir" && pnpm add new-package@version)
done
```

---

### 🆕 Creating a New Example

You want to showcase a new integration (Wagmi, Solana, etc.).

```bash
# 1. Create from base
pnpm create-example myfeature              # Interactive: choose base
pnpm create-example myfeature --base=next  # Direct: use privy-next-starter

# 2. Customize these files (they're protected):
cd examples/privy-next-myfeature
# - src/app/page.tsx (your UI)
# - src/providers/providers.tsx (your setup)
# - package.json (your dependencies)
# - README.md (your docs)

# 3. Test it
pnpm install && pnpm build
```

**Don't want certain base components in your example?**

Edit `.sync-manifest.json`:

```json
"sectionOverrides": {
  "examples/privy-next-myfeature": {
    "exclude": ["src/components/sections/wallet-actions.tsx"],
    "reason": "Uses custom implementation"
  }
}
```

---

### 🔧 Updating One Example Only

You're making changes specific to one example.

```bash
# Just edit it directly
cd examples/privy-next-farcaster
# Make your changes - no sync needed

# Protected files (won't be overwritten):
# - page.tsx, providers.tsx, README.md, package.json
```

---

## Understanding Sync

### What Syncs?

| Category           | Files                                                    | Behavior                         |
| ------------------ | -------------------------------------------------------- | -------------------------------- |
| 🟢 **Always**      | `components/ui/*`, configs, `layout.tsx`                 | Auto-syncs everywhere            |
| 🟡 **Conditional** | `components/sections/*`                                  | Syncs unless example excludes it |
| 🔴 **Protected**   | `page.tsx`, `providers.tsx`, `README.md`, `package.json` | Never overwritten                |

### Adding Features to Protected Files

**Problem**: You want to add something to `page.tsx` in all examples.

**Solution**: Extract to a component.

```bash
# 1. Create new component in base
code privy-next-starter/src/components/sections/analytics.tsx

# 2. Sync it
pnpm sync --folder=analytics --apply

# 3. Import in each example's page.tsx
code examples/privy-next-wagmi/src/app/page.tsx
# Add: import Analytics from "@/components/sections/analytics"
# Add: <Analytics />
```

---

## Commands

`check-drift` compares files between base starters and examples to find files that have diverged. It shows:

- 🔴 **Critical** - "always" sync files that differ (should match base)
- 🟡 **Warning** - "section" files that differ (might be intentional)
- ❌ **Missing** - Files in base but not in examples

---

`pnpm sync` previews what would be copied from base starters to examples (no files are changed). `pnpm sync:apply` performs the copies.

- `pnpm sync` – dry run; shows planned updates, skips, and up-to-date files
- `pnpm sync:apply` – actually writes changes to examples
- Scopes: add `--target=<example>` and/or `--folder=<path-fragment>` to limit the sync

---

## Common Commands

```bash
# Check what's out of sync
pnpm check-drift
pnpm check-drift --target=wagmi      # One example
pnpm check-drift --folder=ui         # Specific files

# Preview changes (dry run)
pnpm sync
pnpm sync --target=wagmi             # One example
pnpm sync --folder=ui                # Specific files

# Apply changes
pnpm sync:apply
pnpm sync --target=wagmi --apply     # One example
pnpm sync --folder=ui --apply        # Specific files
```

---

## Troubleshooting

**Build fails after sync?**

```bash
# Check if base added new dependencies
cd privy-next-starter && git diff package.json
# Add them to your example
cd ../examples/privy-next-wagmi && pnpm add missing-package
```

**File won't sync?**

- Check if it's in `never` rules in `.sync-manifest.json`
- Check if it's in `sectionOverrides` for that example

**Need to reset an example completely?**

```bash
# ⚠️ This deletes example customizations!
pnpm sync --target=wagmi --folder=page.tsx --force --apply
```

---

## Key Rules

✅ **Edit shared components in base** → Sync propagates to examples  
✅ **Edit example-specific code in examples** → Won't be overwritten  
✅ **Always sync dependencies manually** → `package.json` is protected  
✅ **Extract to components** → Don't force-sync protected files

❌ **Don't manually copy files** → Use sync system  
❌ **Don't edit base-synced files in examples** → Changes will be overwritten

---

## File Naming

Format: `privy-[platform]-[feature]`

Examples: `privy-next-wagmi`, `privy-next-farcaster`, `privy-react-pwa`
