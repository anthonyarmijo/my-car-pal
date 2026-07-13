import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const packageRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const tokenSourcePath = path.join(packageRoot, "src/tokens/tokens.ts");
const tokenJsonPath = path.join(packageRoot, "src/tokens/tokens.json");
const writeMode = process.argv.includes("--write");

function camelCaseTokenName(name) {
  return name.replace(/\.([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

function addTokenVariables(target, prefix, group, transformName = (name) => name) {
  for (const [name, token] of Object.entries(group)) {
    target[`${prefix}.${transformName(name)}`] = token.cssVariable;
  }
}

async function importTokenSource() {
  const source = await readFile(tokenSourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: tokenSourcePath,
  });
  const encoded = Buffer.from(transpiled.outputText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

function buildTokenSnapshot(tokens) {
  const cssVariables = {};

  addTokenVariables(cssVariables, "color", tokens.color.primitive);
  addTokenVariables(cssVariables, "color", tokens.color.semantic, camelCaseTokenName);
  addTokenVariables(cssVariables, "color", tokens.color.state, camelCaseTokenName);
  addTokenVariables(cssVariables, "space", tokens.space);
  addTokenVariables(cssVariables, "radius", tokens.radius);
  addTokenVariables(cssVariables, "shadow", tokens.shadow);
  addTokenVariables(cssVariables, "typography.family", tokens.typography.family);
  addTokenVariables(cssVariables, "typography.size", tokens.typography.size);
  addTokenVariables(cssVariables, "typography.lineHeight", tokens.typography.lineHeight);
  addTokenVariables(cssVariables, "typography.weight", tokens.typography.weight);
  addTokenVariables(cssVariables, "focus", tokens.focus);

  return {
    name: tokens.name,
    version: tokens.version,
    theme: tokens.theme,
    description: tokens.description,
    source: "packages/ui/src/tokens/tokens.ts",
    cssRuntime: "packages/ui/src/styles/tokens.css",
    groups: ["color.primitive", "color.semantic", "color.state", "space", "radius", "shadow", "typography", "focus"],
    cssVariables,
  };
}

const { myCarPalTokens } = await importTokenSource();
const expected = `${JSON.stringify(buildTokenSnapshot(myCarPalTokens), null, 2)}\n`;
const actual = await readFile(tokenJsonPath, "utf8");

if (actual === expected) {
  console.log("Token JSON snapshot is in sync.");
  process.exit(0);
}

if (writeMode) {
  await writeFile(tokenJsonPath, expected);
  console.log("Token JSON snapshot updated.");
  process.exit(0);
}

console.error("Token JSON snapshot is out of sync. Run `npm run tokens:write --workspace @my-car-pal/ui`.");
process.exit(1);
