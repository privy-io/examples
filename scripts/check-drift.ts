#!/usr/bin/env ts-node
/**
 * Check for drift between base starters and examples
 * Reports files that have diverged unexpectedly
 *
 * Usage:
 *   pnpm check-drift                   # Check all examples
 *   pnpm check-drift --target=wagmi    # Check specific example
 *   pnpm check-drift --folder=ui       # Check only UI components
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";
import { execSync } from "child_process";

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

const REPO_ROOT = path.resolve(__dirname, "..");

function loadManifest(): SyncManifest {
  const manifestPath = path.join(REPO_ROOT, ".sync-manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function getDiff(file1: string, file2: string): string | null {
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) return null;

  try {
    const diff = execSync(`diff -u "${file1}" "${file2}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    return diff;
  } catch (error: any) {
    // diff returns exit code 1 when files differ, which throws
    return error.stdout || "Files differ";
  }
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

function getFiles(basePath: string, patterns: string[]): string[] {
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const fullPattern = path.join(basePath, pattern);
    const matches = glob.sync(fullPattern, { nodir: true });
    allFiles.push(...matches.map((f) => path.relative(basePath, f)));
  }

  return [...new Set(allFiles)];
}

function checkDrift(
  base: SyncManifest["bases"][0],
  manifest: SyncManifest,
  options: { targetFilter?: string; folderFilter?: string }
): void {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📦 Base: ${base.name}`);
  console.log(`${"=".repeat(80)}\n`);

  const basePath = path.join(REPO_ROOT, base.path);
  const syncPatterns = [...base.syncRules.always, ...base.syncRules.sections];
  const filesToCheck = getFiles(basePath, syncPatterns);

  const targets = options.targetFilter
    ? base.targets.filter((t) => t.includes(options.targetFilter!))
    : base.targets;

  if (targets.length === 0) {
    console.log(`⚠️  No targets match filter: ${options.targetFilter}\n`);
    return;
  }

  let totalDrifted = 0;

  for (const target of targets) {
    const targetPath = path.join(REPO_ROOT, target);
    if (!fs.existsSync(targetPath)) continue;

    const drifted: Array<{ file: string; category: string }> = [];
    const missing: string[] = [];

    for (const relPath of filesToCheck) {
      // Apply folder filter if specified
      if (options.folderFilter && !relPath.includes(options.folderFilter)) {
        continue;
      }

      // Skip if in section overrides
      const override = manifest.sectionOverrides.rules[target];
      if (override && override.exclude.includes(relPath)) {
        continue;
      }

      const srcFile = path.join(basePath, relPath);
      const destFile = path.join(targetPath, relPath);

      if (!fs.existsSync(destFile)) {
        missing.push(relPath);
        continue;
      }

      const srcContent = fs.readFileSync(srcFile, "utf-8");
      const destContent = fs.readFileSync(destFile, "utf-8");

      if (srcContent !== destContent) {
        const category = matchesPattern(relPath, base.syncRules.always)
          ? "always"
          : "section";
        drifted.push({ file: relPath, category });
      }
    }

    if (drifted.length > 0 || missing.length > 0) {
      console.log(`\n📂 ${target}`);
      console.log(`${"-".repeat(80)}`);

      if (drifted.length > 0) {
        console.log(`   ⚠️  Drifted files: ${drifted.length}`);
        drifted.forEach(({ file, category }) => {
          const severity = category === "always" ? "🔴" : "🟡";
          console.log(`      ${severity} ${file} (${category})`);
        });
        totalDrifted += drifted.length;
      }

      if (missing.length > 0) {
        console.log(`   ❌ Missing files: ${missing.length}`);
        missing.forEach((file) => {
          console.log(`      • ${file}`);
        });
      }
    }
  }

  if (totalDrifted === 0) {
    console.log(`\n✅ All examples are in sync with ${base.name}!\n`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetFilter = args
    .find((arg) => arg.startsWith("--target="))
    ?.split("=")[1];
  const baseFilter = args
    .find((arg) => arg.startsWith("--base="))
    ?.split("=")[1];
  const folderFilter = args
    .find((arg) => arg.startsWith("--folder="))
    ?.split("=")[1];

  console.log("🔍 Privy Examples - Drift Checker\n");
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
    checkDrift(base, manifest, { targetFilter, folderFilter });
  }

  console.log(`${"=".repeat(80)}\n`);
  console.log("Legend:");
  console.log('  🔴 Critical - "always" sync files that drifted');
  console.log(
    '  🟡 Warning - "section" files that drifted (might be intentional)'
  );
  console.log('\n💡 Run "pnpm sync --apply" to sync changes from base\n');
}

main();
