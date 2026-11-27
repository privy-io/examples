const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { test } = require("node:test");
const ts = require("typescript");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(__dirname, ".sync-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (relativePath, content) => {
    const file = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  write(
    ".sync-manifest.json",
    JSON.stringify({
      bases: [
        {
          name: "privy-next-starter",
          path: "privy-next-starter",
          targets: ["examples/demo"],
          syncRules: {
            always: ["src/components/ui/**/*"],
            sections: ["src/components/sections/*"],
            never: ["src/components/ui/protected.tsx"],
          },
        },
      ],
      sectionOverrides: {
        rules: {
          "examples/demo": {
            exclude: ["src/components/sections/custom.tsx"],
            reason: "Custom",
          },
        },
      },
    }),
  );
  fs.mkdirSync(path.join(root, "examples/demo"), { recursive: true });
  return { root, write };
}

function run(script, root, ...args) {
  const sourcePath = path.join(__dirname, script);
  const source = fs.readFileSync(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  });
  const compiled = path.join(root, "scripts", script + ".cjs");
  fs.mkdirSync(path.dirname(compiled), { recursive: true });
  fs.writeFileSync(compiled, outputText);
  return execFileSync(process.execPath, [compiled, ...args], {
    encoding: "utf8",
    env: { NODE_PATH: path.join(__dirname, "../node_modules") },
  });
}

for (const file of ["button.tsx", "forms/input.tsx", "forms/fields/text.tsx"]) {
  test(`sync copies UI file at ${file} and respects dry run`, (t) => {
    const { root, write } = fixture(t);
    const relative = `src/components/ui/${file}`;
    write(`privy-next-starter/${relative}`, "base");
    write(`examples/demo/${relative}`, "old");
    const target = path.join(root, "examples/demo", relative);

    assert.match(run("sync-from-base.ts", root), /Would copy: 1 files/);
    assert.equal(fs.readFileSync(target, "utf8"), "old");
    run("sync-from-base.ts", root, "--apply");
    assert.equal(fs.readFileSync(target, "utf8"), "base");
    assert.match(run("check-drift.ts", root), /All examples are in sync/);
  });

  test(`drift checker classifies ${file} as always-sync`, (t) => {
    const { root, write } = fixture(t);
    const relative = `src/components/ui/${file}`;
    write(`privy-next-starter/${relative}`, "base");
    write(`examples/demo/${relative}`, "old");
    assert.match(
      run("check-drift.ts", root),
      new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " \\(always\\)"),
    );
  });
}

test("sync preserves protected and overridden files", (t) => {
  const { root, write } = fixture(t);
  for (const relative of [
    "src/components/ui/protected.tsx",
    "src/components/sections/custom.tsx",
  ]) {
    write(`privy-next-starter/${relative}`, "base");
    write(`examples/demo/${relative}`, "custom");
  }
  run("sync-from-base.ts", root, "--apply");
  assert.equal(
    fs.readFileSync(
      path.join(root, "examples/demo/src/components/ui/protected.tsx"),
      "utf8",
    ),
    "custom",
  );
  assert.equal(
    fs.readFileSync(
      path.join(root, "examples/demo/src/components/sections/custom.tsx"),
      "utf8",
    ),
    "custom",
  );
});
