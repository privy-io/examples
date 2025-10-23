#!/usr/bin/env ts-node
/**
 * Sync files from base starters to example repos
 *
 * Usage:
 *   pnpm sync                     # Dry run - show what would change
 *   pnpm sync --apply             # Apply changes
 *   pnpm sync --target wagmi      # Sync only privy-next-wagmi
 *   pnpm sync --base next         # Sync only from privy-next-starter
 *   pnpm sync --folder ui         # Sync only files matching "ui" (e.g., components/ui)
 *   pnpm sync --folder src/components/sections/fund-wallet.tsx  # Sync specific file
 *   pnpm sync --force --folder page.tsx --apply   # Force sync protected files (use with caution!)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { glob } from "glob";

interface SyncManifest {
  bases: Array<{
    name: string;
    path: string;
    targets: string[];
    syncRules: {
      always: string[];
      sections: string[];
      never: string[];
    };
  }>;
  sectionOverrides: {
    rules: Record<string, { exclude: string[]; reason: string }>;
  };
}

interface SyncOperation {
  type: "copy" | "skip" | "conflict";
  from: string;
  to: string;
  reason: string;
}

const REPO_ROOT = path.resolve(__dirname, "..");

function loadManifest(): SyncManifest {
  const manifestPath = path.join(REPO_ROOT, ".sync-manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function matchesPattern(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\*\*/g, ".*")
          .replace(/\*/g, "[^/]*")
          .replace(/\//g, "\\/") +
        "$"
    );
    return regex.test(filePath);
  });
}

function shouldSync(
  relPath: string,
  rules: SyncManifest["bases"][0]["syncRules"],
  targetPath: string,
  manifest: SyncManifest,
  force: boolean = false
): {
  should: boolean;
  reason: string;
  category: "always" | "section" | "never";
} {
  // Check if explicitly excluded
  if (matchesPattern(relPath, rules.never)) {
    if (force) {
      return {
        should: true,
        reason: "Protected file (forced)",
        category: "never",
      };
    }
    return { should: false, reason: "Protected file", category: "never" };
  }

  // Check always-sync patterns
  if (matchesPattern(relPath, rules.always)) {
    return { should: true, reason: "Always sync", category: "always" };
  }

  // Check section files with overrides
  if (matchesPattern(relPath, rules.sections)) {
    const override = manifest.sectionOverrides.rules[targetPath];
    if (override && override.exclude.includes(relPath)) {
      return {
        should: false,
        reason: `Excluded: ${override.reason}`,
        category: "section",
      };
    }
    return { should: true, reason: "Section component", category: "section" };
  }

  return { should: false, reason: "Not in sync rules", category: "never" };
}

function getFiles(basePath: string, patterns: string[]): string[] {
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const fullPattern = path.join(basePath, pattern);
    const matches = glob.sync(fullPattern, { nodir: true });
    allFiles.push(...matches.map((f) => path.relative(basePath, f)));
  }

  return [...new Set(allFiles)];
}

function filesAreIdentical(file1: string, file2: string): boolean {
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) return false;
  const content1 = fs.readFileSync(file1, "utf-8");
  const content2 = fs.readFileSync(file2, "utf-8");
  return content1 === content2;
}

function syncBase(
  base: SyncManifest["bases"][0],
  manifest: SyncManifest,
  options: {
    apply: boolean;
    targetFilter?: string;
    folderFilter?: string;
    force?: boolean;
  }
): void {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📦 Base: ${base.name}`);
  console.log(`${"=".repeat(80)}\n`);

  const basePath = path.join(REPO_ROOT, base.path);
  const allPatterns = [...base.syncRules.always, ...base.syncRules.sections];
  const filesToCheck = getFiles(basePath, allPatterns);

  const targets = options.targetFilter
    ? base.targets.filter((t) => t.includes(options.targetFilter!))
    : base.targets;

  if (targets.length === 0) {
    console.log(`⚠️  No targets match filter: ${options.targetFilter}\n`);
    return;
  }

  for (const target of targets) {
    console.log(`\n📂 ${target}`);
    console.log(`${"-".repeat(80)}`);

    const targetPath = path.join(REPO_ROOT, target);
    if (!fs.existsSync(targetPath)) {
      console.log(`   ⚠️  Target directory not found, skipping\n`);
      continue;
    }

    const operations: SyncOperation[] = [];
    let copied = 0;
    let skipped = 0;
    let upToDate = 0;

    for (const relPath of filesToCheck) {
      // Apply folder filter if specified
      if (options.folderFilter && !relPath.includes(options.folderFilter)) {
        continue;
      }

      const srcFile = path.join(basePath, relPath);
      const destFile = path.join(targetPath, relPath);

      const { should, reason, category } = shouldSync(
        relPath,
        base.syncRules,
        target,
        manifest,
        options.force || false
      );

      if (!should) {
        operations.push({
          type: "skip",
          from: relPath,
          to: relPath,
          reason,
        });
        skipped++;
        continue;
      }

      // Check if files are identical
      if (filesAreIdentical(srcFile, destFile)) {
        upToDate++;
        continue;
      }

      operations.push({
        type: "copy",
        from: relPath,
        to: relPath,
        reason: `${reason} (${category})`,
      });

      if (options.apply) {
        const destDir = path.dirname(destFile);
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcFile, destFile);
        copied++;
      }
    }

    // Print summary
    if (options.apply) {
      console.log(`   ✅ Copied: ${copied} files`);
      console.log(`   ⏭️  Skipped: ${skipped} files (protected)`);
      console.log(`   ✓  Up-to-date: ${upToDate} files`);
    } else {
      const willCopy = operations.filter((op) => op.type === "copy").length;
      console.log(`   📋 Would copy: ${willCopy} files`);
      console.log(`   ⏭️  Would skip: ${skipped} files (protected)`);
      console.log(`   ✓  Up-to-date: ${upToDate} files`);

      if (willCopy > 0) {
        console.log(`\n   Files that would be updated:`);
        operations
          .filter((op) => op.type === "copy")
          .slice(0, 10)
          .forEach((op) => {
            console.log(`      • ${op.from}`);
          });
        if (willCopy > 10) {
          console.log(`      ... and ${willCopy - 10} more`);
        }
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const force = args.includes("--force");
  const targetFilter = args
    .find((arg) => arg.startsWith("--target="))
    ?.split("=")[1];
  const baseFilter = args
    .find((arg) => arg.startsWith("--base="))
    ?.split("=")[1];
  const folderFilter = args
    .find((arg) => arg.startsWith("--folder="))
    ?.split("=")[1];

  console.log("🔄 Privy Examples - Base Sync Tool\n");
  console.log(`Mode: ${apply ? "✍️  APPLY CHANGES" : "👁️  DRY RUN"}`);
  if (force) console.log(`⚠️  FORCE MODE: Will sync protected files!`);
  if (targetFilter)
    console.log(`Filter: Only targets matching "${targetFilter}"`);
  if (baseFilter) console.log(`Filter: Only base matching "${baseFilter}"`);
  if (folderFilter)
    console.log(`Filter: Only files matching "${folderFilter}"`);

  const manifest = loadManifest();

  const bases = baseFilter
    ? manifest.bases.filter((b) => b.name.includes(baseFilter))
    : manifest.bases;

  for (const base of bases) {
    syncBase(base, manifest, { apply, targetFilter, folderFilter, force });
  }

  console.log(`\n${"=".repeat(80)}`);
  if (!apply) {
    console.log("\n💡 This was a dry run. Use --apply to make changes.");
    console.log("   Examples:");
    console.log(
      "     pnpm sync --apply                    # Apply all changes"
    );
    console.log(
      "     pnpm sync --target=wagmi --apply     # Sync only wagmi example"
    );
    console.log(
      "     pnpm sync --base=next --apply        # Sync only from next-starter"
    );
    console.log(
      "     pnpm sync --folder=ui --apply        # Sync only UI components"
    );
    console.log(
      "     pnpm sync --folder=page.tsx --force --apply  # Force sync protected files (⚠️ use with caution!)\n"
    );
  } else {
    console.log("\n✅ Sync complete!\n");
  }
}

main();
