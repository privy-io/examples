#!/usr/bin/env ts-node
/**
 * Create a new example from a base starter
 *
 * Usage:
 *   pnpm create-example wagmi               # Interactive - asks which base
 *   pnpm create-example --base=next wagmi   # Creates privy-next-wagmi
 *   pnpm create-example --base=react pwa    # Creates privy-react-pwa
 *   pnpm create-example --starter=privy-next-starter --name=my-feature
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";

const REPO_ROOT = path.resolve(__dirname, "..");

interface SyncManifest {
  bases: Array<{
    name: string;
    path: string;
    targets: string[];
    syncRules: any;
  }>;
  sectionOverrides: any;
}

function loadManifest(): SyncManifest {
  const manifestPath = path.join(REPO_ROOT, ".sync-manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function saveManifest(manifest: SyncManifest): void {
  const manifestPath = path.join(REPO_ROOT, ".sync-manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf-8"
  );
}

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function getAvailableBaseStarters(): string[] {
  const items = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
  const starters: string[] = [];

  for (const item of items) {
    if (
      item.isDirectory() &&
      item.name.startsWith("privy-") &&
      item.name.endsWith("-starter")
    ) {
      starters.push(item.name);
    }
  }

  return starters.sort();
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let baseStarter = "";
  let featureName = "";

  for (const arg of args) {
    if (arg.startsWith("--base=") || arg.startsWith("--starter=")) {
      baseStarter = arg.split("=")[1];
      // If they provided just the platform name, convert to full starter name
      if (!baseStarter.endsWith("-starter")) {
        baseStarter = `privy-${baseStarter}-starter`;
      }
    } else if (arg.startsWith("--name=")) {
      featureName = arg.split("=")[1];
    } else if (!arg.startsWith("--")) {
      featureName = arg;
    }
  }

  // Get available base starters
  const availableStarters = getAvailableBaseStarters();

  if (availableStarters.length === 0) {
    console.error("❌ No base starters found in repository");
    process.exit(1);
  }

  // Interactive prompts if not provided
  if (!featureName) {
    featureName = await askQuestion(
      "Example name (e.g., 'wagmi', 'farcaster'): "
    );
    if (!featureName) {
      console.error("❌ Example name is required");
      process.exit(1);
    }
  }

  if (!baseStarter) {
    console.log("\nAvailable base starters:");
    availableStarters.forEach((starter, index) => {
      const isDefault = starter === "privy-next-starter" ? " (default)" : "";
      console.log(`  ${index + 1}. ${starter}${isDefault}`);
    });

    const choice = await askQuestion("\nChoose base starter [1]: ");
    const selectedIndex = choice ? parseInt(choice) - 1 : 0;

    if (selectedIndex < 0 || selectedIndex >= availableStarters.length) {
      console.error("❌ Invalid choice");
      process.exit(1);
    }

    baseStarter = availableStarters[selectedIndex];
  }

  // Extract platform from starter name (e.g., privy-next-starter -> next)
  const platform = baseStarter.replace("privy-", "").replace("-starter", "");
  const exampleName = `privy-${platform}-${featureName}`;
  const basePath = path.join(REPO_ROOT, baseStarter);
  const examplePath = path.join(REPO_ROOT, "examples", exampleName);

  console.log("\n🚀 Creating new example\n");
  console.log(`   Base:    ${baseStarter}`);
  console.log(`   Example: ${exampleName}`);
  console.log(`   Path:    examples/${exampleName}\n`);

  // Check if base exists
  if (!fs.existsSync(basePath)) {
    console.error(`❌ Base starter not found: ${baseStarter}`);
    console.error(`   Available bases: ${availableStarters.join(", ")}`);
    process.exit(1);
  }

  // Check if example already exists
  if (fs.existsSync(examplePath)) {
    console.error(`❌ Example already exists: examples/${exampleName}`);
    process.exit(1);
  }

  // Confirm
  const confirm = await askQuestion("Create this example? (y/n): ");
  if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
    console.log("❌ Cancelled");
    process.exit(0);
  }

  console.log("\n📁 Creating directory...");
  fs.mkdirSync(path.dirname(examplePath), { recursive: true });

  console.log("📋 Copying files from base starter...");
  try {
    execSync(
      `rsync -av --exclude='node_modules' --exclude='.next' --exclude='pnpm-lock.yaml' --exclude='.turbo' "${basePath}/" "${examplePath}/"`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.error("❌ Failed to copy files");
    process.exit(1);
  }

  console.log("📝 Updating sync manifest...");
  const manifest = loadManifest();

  const baseConfig = manifest.bases.find((b) => b.name === baseStarter);
  if (!baseConfig) {
    console.error(
      `❌ Base configuration not found in manifest: ${baseStarter}`
    );
    process.exit(1);
  }

  // Add to targets
  const targetPath = `examples/${exampleName}`;
  if (!baseConfig.targets.includes(targetPath)) {
    baseConfig.targets.push(targetPath);
    baseConfig.targets.sort();
    saveManifest(manifest);
  }

  console.log("\n✅ Example created successfully!\n");
  console.log("📝 Next steps:\n");
  console.log(`   1. cd examples/${exampleName}`);
  console.log(`   2. Edit src/app/page.tsx - Add your example UI`);
  console.log(`   3. Edit src/providers/providers.tsx - Add your providers`);
  console.log(`   4. Edit package.json - Add feature-specific dependencies`);
  console.log(`   5. Edit README.md - Document your example`);
  console.log(`   6. pnpm install && pnpm dev - Test it\n`);
  console.log("💡 The example is now tracked in .sync-manifest.json");
  console.log("   Future base updates will automatically sync!\n");
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
