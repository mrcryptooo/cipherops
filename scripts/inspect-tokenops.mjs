import { readFileSync, existsSync } from "fs";

const NODE_MODULES = "./node_modules";

function readPkg(pkgName) {
  try {
    const raw = readFileSync(`${NODE_MODULES}/${pkgName}/package.json`, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function checkInstalled(pkgName) {
  return existsSync(`${NODE_MODULES}/${pkgName}/package.json`);
}

function printSection(title) {
  console.log("\n" + "=".repeat(60));
  console.log(" " + title);
  console.log("=".repeat(60));
}

// ── 1 & 2: Read package.json for each SDK ────────────────────────
printSection("Package Info: @tokenops/sdk");
const tokenopsPkg = readPkg("@tokenops/sdk");
if (tokenopsPkg) {
  console.log("  version    :", tokenopsPkg.version ?? "(none)");
  console.log("  description:", tokenopsPkg.description ?? "(none)");
} else {
  console.log("  NOT FOUND in node_modules");
}

printSection("Package Info: @zama-fhe/sdk");
const zamaFhePkg = readPkg("@zama-fhe/sdk");
if (zamaFhePkg) {
  console.log("  version    :", zamaFhePkg.version ?? "(none)");
  console.log("  description:", zamaFhePkg.description ?? "(none)");
} else {
  console.log("  NOT FOUND in node_modules");
}

// ── 3: Peer dependencies with installed status ───────────────────
printSection("Peer Dependencies (@tokenops/sdk)");
const peers = tokenopsPkg?.peerDependencies ?? {};
if (Object.keys(peers).length === 0) {
  console.log("  (none listed)");
} else {
  for (const [name, range] of Object.entries(peers)) {
    const installed = checkInstalled(name);
    const installedPkg = installed ? readPkg(name) : null;
    const installedVersion = installedPkg?.version ?? "?";
    console.log(
      `  ${name}@${range}  ->  ${installed ? `installed (${installedVersion})` : "NOT installed"}`
    );
  }
}

// ── 4: DEPLOYED_ADDRESSES from @tokenops/sdk ────────────────────
printSection("DEPLOYED_ADDRESSES from @tokenops/sdk");
try {
  const mod = await import("@tokenops/sdk");
  if (mod.DEPLOYED_ADDRESSES !== undefined) {
    console.log(JSON.stringify(mod.DEPLOYED_ADDRESSES, null, 2));
  } else {
    console.log("  DEPLOYED_ADDRESSES not exported from @tokenops/sdk");
    console.log("  Exported keys:", Object.keys(mod).join(", ") || "(none)");
  }
} catch (e) {
  console.log("  ERROR importing @tokenops/sdk:", e.message);
}

// ── Helper: import a subpath and print its exported keys ─────────
async function inspectSubpath(subpath) {
  try {
    const mod = await import(subpath);
    const keys = Object.keys(mod);
    console.log(`  OK -- exported keys: ${keys.length ? keys.join(", ") : "(none)"}`);
    return true;
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
    return false;
  }
}

// ── 5–8: Core FHE subpaths ────────────────────────────────────────
const coreSubpaths = [
  "@tokenops/sdk/fhe",
  "@tokenops/sdk/fhe-airdrop",
  "@tokenops/sdk/fhe-disperse",
  "@tokenops/sdk/fhe-vesting",
];

const coreResults = {};
for (const sp of coreSubpaths) {
  printSection(`Subpath: ${sp}`);
  coreResults[sp] = await inspectSubpath(sp);
}

// ── 9: React subpaths ─────────────────────────────────────────────
const reactSubpaths = [
  "@tokenops/sdk/fhe/react",
  "@tokenops/sdk/fhe-airdrop/react",
  "@tokenops/sdk/fhe-disperse/react",
  "@tokenops/sdk/fhe-vesting/react",
];

const reactResults = {};
for (const sp of reactSubpaths) {
  printSection(`Subpath (react): ${sp}`);
  reactResults[sp] = await inspectSubpath(sp);
}

// ── 10: TypeScript declaration files ─────────────────────────────
printSection("TypeScript Declaration Files");
const base = `${NODE_MODULES}/@tokenops/sdk`;
const dtsFiles = [
  "dist/index.d.ts",
  "dist/fhe/index.d.ts",
  "dist/fhe-airdrop/index.d.ts",
  "dist/fhe-disperse/index.d.ts",
  "dist/fhe-vesting/index.d.ts",
];

let anyDts = false;
for (const rel of dtsFiles) {
  const full = `${base}/${rel}`;
  const found = existsSync(full);
  console.log(`  ${found ? "PRESENT" : "MISSING"}  ${rel}`);
  if (found) anyDts = true;
}

// ── 11: Summary ───────────────────────────────────────────────────
printSection("SUMMARY");

const allSubpathResults = { ...coreResults, ...reactResults };
const loaded = Object.entries(allSubpathResults).filter(([, v]) => v).map(([k]) => k);
const failed = Object.entries(allSubpathResults).filter(([, v]) => !v).map(([k]) => k);

console.log("\n  Modules loaded successfully:");
if (loaded.length) {
  loaded.forEach((k) => console.log(`    + ${k}`));
} else {
  console.log("    (none)");
}

console.log("\n  Modules that failed to load:");
if (failed.length) {
  failed.forEach((k) => console.log(`    - ${k}`));
} else {
  console.log("    (none)");
}

console.log("\n  TypeScript declarations present:", anyDts ? "YES" : "NO");
console.log("  @tokenops/sdk installed        :", tokenopsPkg ? "YES" : "NO");
console.log("  @zama-fhe/sdk installed        :", zamaFhePkg ? "YES" : "NO");
